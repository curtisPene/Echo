import styles from "./SplashScreen.module.css";

export const SplashScreen = () => {
  return (
    <div className={styles.root}>
      <img src="/favicon.svg" alt="" className={styles.logo} />
      <span className={styles.name}>Echo</span>
    </div>
  );
};
