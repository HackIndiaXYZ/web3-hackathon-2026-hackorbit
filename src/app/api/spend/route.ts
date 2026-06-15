import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Project from '@/models/Project';
import Transaction from '@/models/Transaction';
import { spendTokensOnChain } from '@/lib/blockchain';

export async function POST(request: Request) {
  try {
    const headerApiKey = request.headers.get('x-api-key');
    const { wallet, amount } = await request.json();

    if (!wallet || amount === undefined || amount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid parameters. Please provide wallet and positive amount.' },
        { status: 400 }
      );
    }

    const db = await dbConnect();
    let projectApiKey = '';

    if (db) {
      if (!headerApiKey) {
        return NextResponse.json({ success: false, error: 'API key is required.' }, { status: 401 });
      }
      const project = await Project.findOne({ apiKey: headerApiKey });
      if (!project) {
        return NextResponse.json({ success: false, error: 'Invalid API key.' }, { status: 401 });
      }
      projectApiKey = project.apiKey;
    } else {
      projectApiKey = headerApiKey || 'sf_live_4f89d81a92e105b5f8c6b73a218d';
    }

    const bcResult = await spendTokensOnChain(wallet, Number(amount));

    if (db) {
      await Transaction.create({
        wallet,
        amount: -Number(amount),
        txHash: bcResult.txHash,
        projectApiKey,
        timestamp: new Date(),
      });
    }

    return NextResponse.json({
      success: true,
      txHash: bcResult.txHash,
      wallet,
      amount,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('API Spend Error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
