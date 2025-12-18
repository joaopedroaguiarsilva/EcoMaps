function Home() {
    return (
        <div style={styles.container}>
            <h1>🌍 EcoMaps</h1>
            <h2>Em breve...</h2>
            <p>Você está logado.</p>
        </div>
    );
}

const styles = {
    container: {
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "Arial, sans-serif",
    },
};

export default Home;
