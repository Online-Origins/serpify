import React from 'react';
import styles from './inner-wrapper.module.scss';

export default function InnerWrapper({children} : {children: React.ReactNode}) {
    return (
        <div className={styles.wrapper}>
            {children}
        </div>
    );
}