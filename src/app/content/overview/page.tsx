import PageTitle from "@/components/page-title/page-title.component";
import styles from "./page.module.scss";
import InnerWrapper from "@/components/inner-wrapper/inner-wrapper.component";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/app/api/supabaseClient/route";

export default function ContentOverview({ setPages }: { setPages: any }) {
  const [contents, setContents] = useState<any[]>([]);
  const getContentsRef = useRef(false);

  useEffect(() => {
    if (!getContentsRef.current) {
      getContents();
      getContentsRef.current = true;
    }
  }, []);

  async function getContents() {
    const { data } = await supabase.from("content-items").select();
    if (data) {
      setContents(data);
    }
  }

  return (
    <InnerWrapper>
      <PageTitle title={"Content overview"} />
    </InnerWrapper>
  );
}
