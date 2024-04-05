import styles from './component-wrapper.module.scss';
import classNames from 'classnames';

export default function ComponentWrapper({children, className}: Readonly<{
    children: React.ReactNode;
    className?: String;
  }>) {
    return(
        <div className={classNames(styles.componentWrapper, className)}>
            {children}
        </div>
    );
}