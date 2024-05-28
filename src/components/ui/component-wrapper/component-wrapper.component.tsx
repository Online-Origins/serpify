import classNames from 'classnames';
import styles from './component-wrapper.module.scss';

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