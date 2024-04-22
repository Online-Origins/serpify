import { useEffect, useState } from "react";
import ContentOverview from "./overview";

export default function ContentWriting() {
  const [pages, setPages] = useState(["overview"]);
  const page = pages[pages.length - 1];

  if (page == "overview") {
    return <ContentOverview setPages={setPages} />;
  } else {
    return null;
  }
}
