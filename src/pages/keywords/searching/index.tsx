import PageTitle from '@/components/page-title/page-title.component';
import styles from './index.module.scss';

export default function KeywordSearching({filters} : {filters: any}) {
    return (
        <div className={styles.wrapper}>
            <PageTitle title={"Search keywords"} />
            <p>{filters.subjects.toString()}</p>
        </div>
    )
}