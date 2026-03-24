import { paths } from "@/config";
import useAxios from "./useAxios";

export async function fetchAlbumColor(
  albumhash: string | undefined
): Promise<string> {
  if (!albumhash || albumhash === 'undefined') return '#000000';

  const { data } = await useAxios({
    url: paths.api.colors.album + `/${albumhash}`,
    method: "GET",
  });


  return data.color;
}

