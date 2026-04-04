import { AppSettings } from '@/api/heruClient'

export const COIN_REWARDS = {
  WELCOME_BONUS: 100,
  LIKE_POST: 1,
  COMMENT_POST: 2,
  CREATE_POST: 5,
  JOIN_SPACE: 10,
  CREATE_SPACE: 25,
  JOIN_TEAM: 20,
  CREATE_TEAM: 50,
  ADD_FRIEND: 5,
  FIVE_FRIENDS_BONUS: 50,
  JOIN_TOURNAMENT: 30,
  TOURNAMENT_WIN_FIRST: 500,
  TOURNAMENT_WIN_SECOND: 250,
  TOURNAMENT_WIN_THIRD: 100,
  PURCHASE_ITEM: 10,
  BECOME_TALENT: 100,
  INVITE_FRIEND_TO_TEAM: 10,
};

export async function awardCoins(userId, amount, reason) {
  try {
    const existingBalances = await AppSettings.list({ user_id: userId });
    
    if (existingBalances.length > 0) {
      const current = existingBalances[0];
      const newBalance = (current.balance || 0) + amount;
      const transactions = current.transactions || [];
      
      transactions.push({
        type: 'earn',
        amount,
        reason,
        timestamp: new Date().toISOString()
      });
      
      await AppSettings.update(current.id, {
        balance: newBalance,
        transactions
      });
      
      return newBalance;
    } else {
      await AppSettings.create({
        user_id: userId,
        balance: amount,
        transactions: [{
          type: 'earn',
          amount,
          reason,
          timestamp: new Date().toISOString()
        }]
      });
      
      return amount;
    }
  } catch (error) {
    console.error('Error awarding coins:', error);
    return null;
  }
}

export async function spendCoins(userId, amount, reason) {
  try {
    const existingBalances = await AppSettings.list({ user_id: userId });
    
    if (existingBalances.length > 0) {
      const current = existingBalances[0];
      
      if (current.balance < amount) {
        return { success: false, message: 'Insufficient balance' };
      }
      
      const newBalance = current.balance - amount;
      const transactions = current.transactions || [];
      
      transactions.push({
        type: 'spend',
        amount,
        reason,
        timestamp: new Date().toISOString()
      });
      
      await AppSettings.update(current.id, {
        balance: newBalance,
        transactions
      });
      
      return { success: true, newBalance };
    }
    
    return { success: false, message: 'No balance found' };
  } catch (error) {
    console.error('Error spending coins:', error);
    return { success: false, message: error.message };
  }
}

export async function getBalance(userId) {
  try {
    const balances = await AppSettings.list({ user_id: userId });
    return balances.length > 0 ? balances[0].balance : 0;
  } catch (error) {
    console.error('Error getting balance:', error);
    return 0;
  }
}