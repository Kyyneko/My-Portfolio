'use client';
import styles from './SectionDivider.module.css';

export default function SectionDivider({ flip = false }) {
    return (
        <div className={`${styles.divider} ${flip ? styles.flip : ''}`}>
            <div className={styles.gradientLine} />
        </div>
    );
}
