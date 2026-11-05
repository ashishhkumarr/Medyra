import { Link } from "react-router-dom";

import { Button } from "../components/ui/Button";

const NotFoundPage = () => (
  <div className="flex min-h-[60vh] flex-col items-center justify-center text-center animate-fadeUp">
    <h1 className="font-display text-7xl text-primary">404</h1>
    <p className="mt-4 text-lg text-text-muted">The page you are looking for does not exist.</p>
    <Link to="/" className="mt-6">
      <Button>Go Home</Button>
    </Link>
  </div>
);

export default NotFoundPage;
