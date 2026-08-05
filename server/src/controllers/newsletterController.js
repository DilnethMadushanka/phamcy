const { NewsletterSubscriber } = require('../models');
const { sendNewsletterWelcomeEmail } = require('../services/emailService');

const subscribe = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !email.trim()) {
      return res.status(400).json({ message: 'Email address is required' });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check if already subscribed
    const existing = await NewsletterSubscriber.findOne({ where: { email: cleanEmail } });

    if (existing) {
      if (!existing.is_active) {
        existing.is_active = true;
        await existing.save();
      }
    } else {
      await NewsletterSubscriber.create({ email: cleanEmail, is_active: true });
    }

    const discountCode = 'FOUADVIP10';

    // Send Welcome email asynchronously
    sendNewsletterWelcomeEmail(cleanEmail, discountCode).catch((err) => {
      console.error('Failed to dispatch newsletter welcome email:', err);
    });

    res.json({
      message: '🎉 Successfully subscribed to Fouad Pharmacies VIP Club!',
      discountCode,
    });
  } catch (error) {
    res.status(500).json({ message: 'Subscription failed', error: error.message });
  }
};

const getSubscribers = async (req, res) => {
  try {
    const subscribers = await NewsletterSubscriber.findAll({
      order: [['createdAt', 'DESC']],
    });
    res.json(subscribers);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch subscribers', error: error.message });
  }
};

module.exports = {
  subscribe,
  getSubscribers,
};
