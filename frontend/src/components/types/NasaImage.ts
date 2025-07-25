export interface NasaImage {
  id: number;
  name: string;
  description: string;
  type: string;
  launch_date: string;
  image_url: string | null;
  status: string;
}
