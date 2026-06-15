import { NextResponse } from 'next/server';
import { getBalanceOnChain } from '@/lib/blockchain';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const wallet = searchParams.get('wallet');

    if (!wallet) {
      return NextResponse.json({ success: false, error: 'Wallet address is required.' }, { status: 400 });
    }

    const balance = await getBalanceOnChain(wallet);

    return NextResponse.json({
      success: true,
      wallet,
      balance,
    });
  } catch (error: any) {
    console.error('API Balance Error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
