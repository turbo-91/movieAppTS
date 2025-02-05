export interface INetzkinoMovie extends Document {
  netzkinoId: number;
  slug: string;
  title: string;
  year: number;
  overview: string;
  imgNetzkino: string;
  imgNetzkinoSmall: string;
  queries: string[];
}
