import PageTitle from "@/components/page-title/page-title.component";
import styles from "./index.module.scss";
import InnerWrapper from "@/components/inner-wrapper/inner-wrapper.component";

export default function KeywordSearching({
  filters,
  setPages,
  generatedKeywords,
}: {
  filters: any;
  setPages: any;
  generatedKeywords?: any;
}) {
  return (
    <InnerWrapper>
      <PageTitle
        title={"Search keywords"}
        goBack={() =>
          setPages((prevPages: any) => {
            // Create a new array with all elements except the last one
            return prevPages.slice(0, -1);
          })
        }
      />
      <div className={styles.textWrapper}>
        <p>Input:</p>
        {filters.subjects.map((subject: string) => (
          <p key={subject}>{subject}</p>
        ))}
      </div>
      <div className={styles.textWrapper}>
        <p>Generated keywords:</p>
        {generatedKeywords.length > 0 ? (
          generatedKeywords.map((keyword: string) => (
            <p key={keyword}>{keyword}</p>
          ))
        ) : (
          <p>Loading...</p>
        )}
      </div>
    </InnerWrapper>
  );
}
