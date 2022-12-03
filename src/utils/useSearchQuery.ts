import { useSearchParams } from "react-router-dom";

function setSearch(queries: { [key: string]: string }) {
  return `?${Object.keys(queries)
    .map((i) => `${i}=${queries[i]}`)
    .join("&")}`;
}

export function useSearchQuery(): [{ [key: string]: string }, any] {
  const [searchParams, setSearch] = useSearchParams();
  const queryInterator = searchParams.entries();

  const queries: { [key: string]: string } = {};

  let isEnd: boolean | undefined = false;

  while (!isEnd) {
    const query = queryInterator.next();
    const values = query?.value;
    if (!values) break;
    queries[query.value[0]] = query.value[1];
    isEnd = query.done;
  }

  return [queries, setSearch];
}
