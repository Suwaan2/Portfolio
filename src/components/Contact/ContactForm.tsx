import React, { useState } from 'react';

export function ContactForm() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission here
    console.log('Form submitted:', formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="fullName" className="block text-white mb-2">Full name</label>
        <input
          type="text"
          id="fullName"
          name="fullName"
          value={formData.fullName}
          onChange={handleChange}
          className="w-full px-4 py-3 rounded-lg bg-navy-800 text-white border border-gray-700 focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
          required
        />
      </div>
      
      <div>
        <label htmlFor="email" className="block text-white mb-2">Email</label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className="w-full px-4 py-3 rounded-lg bg-navy-800 text-white border border-gray-700 focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
          required
        />
      </div>
      
      <div>
        <label htmlFor="message" className="block text-white mb-2">Message</label>
        <textarea
          id="message"
          name="message"
          value={formData.message}
          onChange={handleChange}
          rows={6}
          className="w-full px-4 py-3 rounded-lg bg-navy-800 text-white border border-gray-700 focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
          required
        />
      </div>
      
      <button
        type="submit"
        className="w-full py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors duration-200"
      >
        SEND MESSAGE
      </button>
    </form>
  );
}