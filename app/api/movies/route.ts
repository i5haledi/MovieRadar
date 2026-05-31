import { NextResponse } from "next/server";
import { getUpcomingMovies } from "@/lib/tmdb";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const data = await getUpcomingMovies({
      region: "US",
      genre: searchParams.get("genre") ?? undefined,
      month: searchParams.get("month") ?? undefined,
      query: searchParams.get("query") ?? undefined,
      page: searchParams.get("page") ?? "1",
    });

    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load movies.";
    return NextResponse.json({ message }, { status: 500 });
  }
}
