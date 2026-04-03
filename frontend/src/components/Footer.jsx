export default function Footer() {
  return (
    <footer className="bg-white border-top mt-5 py-3 text-center">
      <small className="text-muted">
        © {new Date().getFullYear()} <a href="https://myself-sanket.netlify.app/" >Sanket Bhuite</a> — Built for Campus Aspirants
      </small>
    </footer>
  );
}
