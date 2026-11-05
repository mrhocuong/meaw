import { NextRequest, NextResponse } from "next/server";
import { getCMSData, resetCMSData, saveCMSData } from "@/lib/db";
import { CMSData, Order } from "@/types/cms";

export const dynamic = "force-dynamic";

export async function GET() {
  const data = getCMSData();
  return NextResponse.json(data);
}

export async function PUT(req: NextRequest) {
  try {
    const body = (await req.json()) as Partial<CMSData>;
    const current = getCMSData();
    const updated: CMSData = {
      siteConfig: body.siteConfig ?? current.siteConfig,
      bowls: body.bowls ?? current.bowls,
      ingredients: body.ingredients ?? current.ingredients,
      news: body.news ?? current.news,
      testimonials: body.testimonials ?? current.testimonials,
      orders: body.orders ?? current.orders,
    };
    saveCMSData(updated);
    return NextResponse.json(updated);
  } catch (err) {
    console.error("PUT /api/cms error:", err);
    return NextResponse.json({ error: "Không thể lưu dữ liệu CMS" }, { status: 400 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (body.action === "reset") {
      const reset = resetCMSData();
      return NextResponse.json(reset);
    }
    if (body.action === "create_order") {
      const current = getCMSData();
      const newOrder: Order = body.order;
      const updated: CMSData = {
        ...current,
        orders: [newOrder, ...current.orders],
      };
      saveCMSData(updated);
      return NextResponse.json({ success: true, order: newOrder });
    }
    return NextResponse.json({ error: "Action không hợp lệ" }, { status: 400 });
  } catch (err) {
    console.error("POST /api/cms error:", err);
    return NextResponse.json({ error: "Lỗi xử lý yêu cầu" }, { status: 400 });
  }
}
