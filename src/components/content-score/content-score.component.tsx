'use client';
import { useEffect } from 'react';
import PageTitle from '../page-title/page-title.component';
import styles from './content-score.module.scss';

export default function ContentScore({contentHTML} : {contentHTML: any}) {
    useEffect(() => {
        console.log(contentHTML)
    }, [contentHTML])

    return (
        <div className={styles.contentScore}>
            <PageTitle title={"Content score"} smallerHeader />
        </ div>
    )
}