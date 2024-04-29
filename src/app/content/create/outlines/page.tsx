'use client';
import { useState } from 'react';
import styles from './page.module.scss';

export default function CreateOutlines() {
    const [contentId, setContentId] = useState(localStorage.getItem('content_id'))
    return(
        <h2>{contentId}</h2>
    )
}