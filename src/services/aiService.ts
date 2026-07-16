export interface AiCategorizationResult {
  category: string;
  confidence: number;
  reason: string;
}

export const aiService = {
  /**
   * Automatically classifies an expense into a category based on the merchant name.
   */
  async classifyExpense(merchant: string): Promise<AiCategorizationResult> {
    // Simulate minor latency
    await new Promise((resolve) => setTimeout(resolve, 300));

    const name = merchant.toLowerCase().trim();

    // Classification mapping based on common merchant names and keywords
    if (
      this._containsAny(name, [
        'starbucks',
        'mcdonald',
        'burger king',
        'subway',
        'pizza',
        'restaurant',
        'cafe',
        'dunkin',
        'coffee',
        'swiggy',
        'zomato',
        'bakery',
        'diner',
      ])
    ) {
      return {
        category: 'Food',
        confidence: 0.98,
        reason: 'Identified food, beverage, or restaurant merchant.',
      };
    }

    if (
      this._containsAny(name, [
        'walmart',
        'target',
        'grocery',
        'supermarket',
        'whole foods',
        'kroger',
        'safeway',
        'trader joe',
        'aldi',
        'costco',
        'spit',
        'vegetable',
        'mart',
      ])
    ) {
      return {
        category: 'Grocery',
        confidence: 0.94,
        reason: 'Identified major supermarket, department store or grocer.',
      };
    }

    if (
      this._containsAny(name, [
        'uber',
        'lyft',
        'grab',
        'ola',
        'taxi',
        'airline',
        'flight',
        'railway',
        'train',
        'metro',
        'delta',
        'expedia',
        'booking.com',
        'airbnb',
        'hotel',
      ])
    ) {
      return {
        category: 'Travel',
        confidence: 0.96,
        reason: 'Merchant associated with transportation, airlines, or lodging.',
      };
    }

    if (
      this._containsAny(name, [
        'shell',
        'exxon',
        'chevron',
        'bp',
        'fuel',
        'gas station',
        'petrol',
        'diesel',
        'gasoline',
      ])
    ) {
      return {
        category: 'Fuel',
        confidence: 0.99,
        reason: 'Identified service station or petroleum merchant.',
      };
    }

    if (
      this._containsAny(name, [
        'amazon',
        'ebay',
        'aliexpress',
        'zara',
        'h&m',
        'nike',
        'adidas',
        'shopping',
        'boutique',
        'nordstrom',
        'apparel',
        'store',
        'mall',
      ])
    ) {
      return {
        category: 'Shopping',
        confidence: 0.92,
        reason: 'Merchant associated with online retail or apparel stores.',
      };
    }

    if (
      this._containsAny(name, [
        'netflix',
        'spotify',
        'hulu',
        'disney',
        'hbo',
        'youtube premium',
        'cinema',
        'theater',
        'concert',
        'ticketmaster',
        'game',
        'steam',
        'playstation',
        'nintendo',
        'xbox',
      ])
    ) {
      return {
        category: 'Entertainment',
        confidence: 0.97,
        reason: 'Identified digital subscription, gaming, or amusement provider.',
      };
    }

    if (
      this._containsAny(name, [
        'electric',
        'water bill',
        'gas bill',
        'power',
        'utility',
        'comcast',
        'at&t',
        'verizon',
        't-mobile',
        'internet',
        'wifi',
        'broadband',
        'mobile recharge',
        'phone bill',
        'insurance',
      ])
    ) {
      return {
        category: 'Bills',
        confidence: 0.95,
        reason: 'Identified periodic utility service or bill provider.',
      };
    }

    if (
      this._containsAny(name, [
        'hospital',
        'pharmacy',
        'cvs',
        'walgreens',
        'clinic',
        'doctor',
        'dentist',
        'medical',
        'health',
        'gym',
        'fitness',
        'insurance health',
      ])
    ) {
      return {
        category: 'Health',
        confidence: 0.96,
        reason: 'Identified pharmacy, medical practice, or physical health provider.',
      };
    }

    if (this._containsAny(name, ['rent', 'landlord', 'housing', 'mortgage'])) {
      return {
        category: 'Rent',
        confidence: 0.98,
        reason: 'Identified rent or lease payment terminology.',
      };
    }

    if (
      this._containsAny(name, [
        'emi',
        'loan',
        'installment',
        'finance',
        'interest payment',
        'credit card payment',
      ])
    ) {
      return {
        category: 'EMI',
        confidence: 0.93,
        reason: 'Identified debt installment or loan repayment payment.',
      };
    }

    if (
      this._containsAny(name, [
        'school',
        'university',
        'college',
        'tuition',
        'udemy',
        'coursera',
        'bookstore',
        'class',
        'course',
      ])
    ) {
      return {
        category: 'Education',
        confidence: 0.94,
        reason: 'Identified educational institution, classes, or course provider.',
      };
    }

    // Default fallback
    return {
      category: 'Other',
      confidence: 0.5,
      reason: 'Uncategorized merchant. Assigned to general category.',
    };
  },

  _containsAny(text: string, keywords: string[]): boolean {
    return keywords.some((keyword) => text.includes(keyword));
  },
};
