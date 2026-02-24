import { supabase } from '../config/supabase';

export type Review = {
  id: string;
  juiceId: string;
  userName: string;
  tasteRating: number;
  qualityRating: number;
  comment: string;
  createdAt: string;
};

function mapRow(row: any): Review {
  return {
    id: row.id,
    juiceId: row.juice_id,
    userName: row.user_name,
    tasteRating: row.taste_rating,
    qualityRating: row.quality_rating,
    comment: row.comment ?? '',
    createdAt: row.created_at,
  };
}

export async function getAllReviews(): Promise<Review[]> {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .order('created_at', { ascending: false });

  if (error || !data) return [];
  return data.map(mapRow);
}

export async function getReviewsForJuice(juiceId: string): Promise<Review[]> {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('juice_id', juiceId)
    .order('created_at', { ascending: false });

  if (error || !data) return [];
  return data.map(mapRow);
}

export async function addReview(
  review: Omit<Review, 'id' | 'createdAt'>,
): Promise<Review | null> {
  const { data: { session } } = await supabase.auth.getSession();

  const { data, error } = await supabase
    .from('reviews')
    .insert({
      user_id: session?.user?.id ?? null,
      juice_id: review.juiceId,
      user_name: review.userName,
      taste_rating: review.tasteRating,
      quality_rating: review.qualityRating,
      comment: review.comment,
    })
    .select()
    .single();

  if (error || !data) return null;
  return mapRow(data);
}

export function averageRating(reviews: Review[]): number {
  if (reviews.length === 0) return 0;
  const total = reviews.reduce((s, r) => s + (r.tasteRating + r.qualityRating) / 2, 0);
  return total / reviews.length;
}
