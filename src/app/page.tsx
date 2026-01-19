import styles from './page.module.css';

export default function HomePage() {
    return (
        <main className={styles.main}>
            <div className={styles.hero}>
                <h1 className={styles.title}>
                    Welcome to <span className={styles.highlight}>Periwinkle Auctions</span>
                </h1>
                <p className={styles.description}>
                    Discover unique items and bid in real-time.
                    Your local auction platform for collectors, sellers, and treasure hunters.
                </p>
                <div className={styles.actions}>
                    <a href="/auctions" className="btn btn-primary">
                        Browse Auctions
                    </a>
                    <a href="/register" className="btn btn-secondary">
                        Create Account
                    </a>
                </div>
            </div>

            <section className={styles.features}>
                <div className={styles.feature}>
                    <div className={styles.featureIcon}>🔴</div>
                    <h3>Live Bidding</h3>
                    <p>Real-time updates when new bids are placed. Never miss an opportunity.</p>
                </div>
                <div className={styles.feature}>
                    <div className={styles.featureIcon}>🔒</div>
                    <h3>Secure Payments</h3>
                    <p>Safe and easy payments powered by Square. Your transactions are protected.</p>
                </div>
                <div className={styles.feature}>
                    <div className={styles.featureIcon}>⏱️</div>
                    <h3>Anti-Sniping</h3>
                    <p>Last-minute bids extend the auction, giving everyone a fair chance.</p>
                </div>
            </section>
        </main>
    );
}
