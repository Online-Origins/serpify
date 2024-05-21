import PageTitle from '../page-title/page-title.component';
import styles from './content-score.module.scss';

export default function ContentScore() {

    return (
        <div className={styles.contentScore}>
            <PageTitle title={"Content score"} smallerHeader />
        </ div>
    )
}