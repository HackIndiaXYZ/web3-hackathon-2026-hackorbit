import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';

export async function POST(request: Request) {
  try {
    const { name, email, walletAddress, avatar } = await request.json();

    if (!walletAddress) {
      return NextResponse.json(
        { success: false, error: 'Wallet address is required to register or update user profile.' },
        { status: 400 }
      );
    }

    const db = await dbConnect();

    if (db) {
      const user = await User.findOneAndUpdate(
        { walletAddress: walletAddress.toLowerCase() },
        { 
          name, 
          email, 
          avatar,
          walletAddress: walletAddress.toLowerCase()
        },
        { upsert: true, new: true }
      );
      
      return NextResponse.json({
        success: true,
        user,
        db: true
      });
    } else {
      // Local/mock database fallback mode
      return NextResponse.json({
        success: true,
        user: { name, email, walletAddress, avatar },
        db: false
      });
    }
  } catch (error: any) {
    console.error('API User Sync Error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
