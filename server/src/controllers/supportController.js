const { ChatMessage, User, sequelize } = require('../models');

const generateAutoReplyText = (userText) => {
  const text = userText.toLowerCase();

  if (text.includes('hi') || text.includes('hello') || text.includes('hey') || text.includes('ayubowan')) {
    return '👋 Hello! Welcome to Fouad Pharmacies. How can our medical & skincare team assist you today?';
  }
  if (text.includes('prescription') || text.includes('rx') || text.includes('medicine') || text.includes('doctor')) {
    return '💊 Need prescription verification? You can upload a photo of your doctor\'s prescription directly via our "Upload Prescription" page! Our licensed pharmacist will verify it within 15 minutes.';
  }
  if (text.includes('delivery') || text.includes('track') || text.includes('shipping') || text.includes('campus') || text.includes('order')) {
    return '🚚 We provide 24/7 Campus Express Delivery! You can track your ongoing orders in real-time under "My Orders & Tracking".';
  }
  if (text.includes('skincare') || text.includes('serum') || text.includes('cream') || text.includes('korean') || text.includes('acne')) {
    return '✨ Looking for skincare recommendations? Check out our Korean Beauty & Dermatological Skincare section under "Shop By Category"!';
  }
  if (text.includes('hours') || text.includes('open') || text.includes('time') || text.includes('location')) {
    return '⏰ Fouad Pharmacies is open 24/7 for online orders & prescription uploads! Physical counter is open from 8:00 AM to 10:00 PM daily.';
  }

  return '🩺 Thank you for contacting Fouad Pharmacies Support! A licensed pharmacist has been notified of your query and will assist you shortly. If urgent, call our campus helpline at +94 11 234 5678.';
};

// 1. Send Chat Message
exports.sendMessage = async (req, res) => {
  try {
    const { message, customer_id } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ message: 'Message text is required' });
    }

    const sender = req.user;
    let targetCustomerId = sender.id;

    if (['Pharmacist', 'Admin', 'Cashier'].includes(sender.role)) {
      if (!customer_id) {
        return res.status(400).json({ message: 'customer_id is required when staff sends a message' });
      }
      targetCustomerId = Number(customer_id);
    }

    const chatMsg = await ChatMessage.create({
      customer_id: targetCustomerId,
      sender_id: sender.id,
      sender_name: sender.name || 'User',
      sender_role: sender.role || 'Customer',
      message: message.trim(),
      is_read: false,
    });

    // Auto-reply logic if message is sent by Customer
    if (sender.role === 'Customer') {
      setTimeout(async () => {
        try {
          const autoReplyContent = generateAutoReplyText(message.trim());
          await ChatMessage.create({
            customer_id: targetCustomerId,
            sender_id: 1,
            sender_name: 'Fouad AI Assistant (Auto-Reply)',
            sender_role: 'Pharmacist',
            message: autoReplyContent,
            is_read: false,
          });
        } catch (err) {
          console.error('Failed to save auto reply message:', err);
        }
      }, 600);
    }

    res.status(201).json(chatMsg);
  } catch (error) {
    console.error('Error sending support chat message:', error);
    res.status(500).json({ message: error.message || 'Failed to send message', error: error.message });
  }
};

// 2. Get Messages for a Customer Thread
exports.getMessages = async (req, res) => {
  try {
    const user = req.user;
    let targetCustomerId = user.id;

    if (['Pharmacist', 'Admin', 'Cashier'].includes(user.role)) {
      if (req.query.customer_id) {
        targetCustomerId = Number(req.query.customer_id);
      }
    }

    const messages = await ChatMessage.findAll({
      where: { customer_id: targetCustomerId },
      order: [['createdAt', 'ASC']],
    });

    res.json(messages);
  } catch (error) {
    console.error('Error fetching chat messages:', error);
    res.status(500).json({ message: 'Failed to fetch chat history', error: error.message });
  }
};

// 3. Get Active Customer Conversations (Admin/Staff only)
exports.getConversations = async (req, res) => {
  try {
    // Find unique customer_ids from ChatMessage
    const customerIdsResult = await ChatMessage.findAll({
      attributes: [
        'customer_id',
        [sequelize.fn('MAX', sequelize.col('createdAt')), 'lastActivity'],
      ],
      group: ['customer_id'],
      order: [[sequelize.fn('MAX', sequelize.col('createdAt')), 'DESC']],
    });

    const conversations = await Promise.all(
      customerIdsResult.map(async (item) => {
        const custId = item.customer_id;
        const customerUser = await User.findByPk(custId, {
          attributes: ['id', 'name', 'email', 'role'],
        });

        const lastMsg = await ChatMessage.findOne({
          where: { customer_id: custId },
          order: [['createdAt', 'DESC']],
        });

        const unreadCount = await ChatMessage.count({
          where: {
            customer_id: custId,
            sender_role: 'Customer',
            is_read: false,
          },
        });

        return {
          customer_id: custId,
          customer_name: customerUser ? customerUser.name : `Customer #${custId}`,
          customer_email: customerUser ? customerUser.email : 'N/A',
          last_message: lastMsg ? lastMsg.message : '',
          last_sender_role: lastMsg ? lastMsg.sender_role : '',
          last_updated: lastMsg ? lastMsg.createdAt : item.getDataValue('lastActivity'),
          unread_count: unreadCount,
        };
      })
    );

    res.json(conversations);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ message: 'Failed to fetch conversations', error: error.message });
  }
};

// 4. Mark Thread Messages as Read
exports.markRead = async (req, res) => {
  try {
    const user = req.user;
    const { customer_id } = req.body;
    let targetCustomerId = user.id;

    if (['Pharmacist', 'Admin', 'Cashier'].includes(user.role) && customer_id) {
      targetCustomerId = Number(customer_id);
      // Staff marks customer messages as read
      await ChatMessage.update(
        { is_read: true },
        { where: { customer_id: targetCustomerId, sender_role: 'Customer', is_read: false } }
      );
    } else {
      // Customer marks staff messages as read
      await ChatMessage.update(
        { is_read: true },
        { where: { customer_id: targetCustomerId, is_read: false } }
      );
    }

    res.json({ message: 'Messages marked as read' });
  } catch (error) {
    console.error('Error marking messages read:', error);
    res.status(500).json({ message: 'Failed to mark read', error: error.message });
  }
};

// 5. End Chat Session (Delete thread messages for customer)
exports.endChat = async (req, res) => {
  try {
    const user = req.user;
    const customer_id = req.body?.customer_id || req.query?.customer_id;
    let targetCustomerId = user.id;

    if (['Pharmacist', 'Admin', 'Cashier'].includes(user.role) && customer_id) {
      targetCustomerId = Number(customer_id);
    }

    // Delete all messages for target customer
    await ChatMessage.destroy({
      where: { customer_id: targetCustomerId },
    });

    res.json({ message: '🎉 Live Support Chat session ended successfully' });
  } catch (error) {
    console.error('Error ending support chat session:', error);
    res.status(500).json({ message: 'Failed to end chat session', error: error.message });
  }
};
