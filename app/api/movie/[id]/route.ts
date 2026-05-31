import { NextResponse } from "next/server";
import { getMovieDetails } from "@/lib/tmdb";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const data = await getMovieDetails(id);
    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load movie details.";
    return NextResponse.json({ message }, { status: 500 });
  }
}

