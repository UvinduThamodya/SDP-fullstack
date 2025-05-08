// src/services/recommendationService.js
import MenuService from './menuService';

const RecommendationService = {
  // Get personalized recommendations based on cart items
  getRecommendations: async (cart, userId) => {
    try {
      // Fetch all menu items
      const allItems = await MenuService.getMenuItems();
      
      // Get items not already in cart
      const cartItemIds = cart.map(item => item.item_id);
      const availableItems = allItems.filter(item => !cartItemIds.includes(item.item_id));
      
      // Separate beverages from other items
      const beverages = availableItems.filter(item => item.category === 'Beverage');
      const nonBeverages = availableItems.filter(item => item.category !== 'Beverage');
      
      // Get at least one beverage recommendation
      const beverageRec = beverages.length > 0 ? 
        [beverages[Math.floor(Math.random() * beverages.length)]] : [];
      
      // Get complementary food items based on cart categories
      const cartCategories = [...new Set(cart.map(item => item.category))];
      let complementaryItems = [];
      
      // Recommend desserts if main dishes are in cart
      if (cartCategories.includes('Main-Dishes') || cartCategories.includes('Sea-Food')) {
        const desserts = nonBeverages.filter(item => item.category === 'Desserts');
        if (desserts.length > 0) {
          complementaryItems.push(desserts[Math.floor(Math.random() * desserts.length)]);
        }
      }
      
      // Recommend main dishes if only beverages/desserts are in cart
      if (!cartCategories.includes('Main-Dishes') && !cartCategories.includes('Sea-Food')) {
        const mains = nonBeverages.filter(item => 
          item.category === 'Main-Dishes' || item.category === 'Sea-Food');
        if (mains.length > 0) {
          complementaryItems.push(mains[Math.floor(Math.random() * mains.length)]);
        }
      }
      
      // Fill remaining slots with random items
      const remainingSlots = 3 - (beverageRec.length + complementaryItems.length);
      if (remainingSlots > 0 && nonBeverages.length > complementaryItems.length) {
        const remainingItems = nonBeverages.filter(item => 
          !complementaryItems.map(i => i.item_id).includes(item.item_id));
        
        for (let i = 0; i < Math.min(remainingSlots, remainingItems.length); i++) {
          const randomIndex = Math.floor(Math.random() * remainingItems.length);
          complementaryItems.push(remainingItems[randomIndex]);
          remainingItems.splice(randomIndex, 1);
        }
      }
      
      return [...beverageRec, ...complementaryItems];
    } catch (error) {
      console.error('Error getting recommendations:', error);
      throw error;
    }
  }
};

export default RecommendationService;
