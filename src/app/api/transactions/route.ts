import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Transaction from '@/models/Transaction';
import { getMockTransactions } from '@/lib/blockchain';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    const db = await dbConnect();

    if (db) {
      const transactions = await Transaction.find()
        .sort({ timestamp: -1 })
        .limit(limit);
      return NextResponse.json({
        success: true,
        transactions,
        mock: false,
      });
    } else {
      const transactions = await getMockTransactions();
      return NextResponse.json({
        success: true,
        transactions: transactions.slice(0, limit),
        mock: true,
      });
    }
  } catch (error: any) {
    console.error('API Transactions Error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
