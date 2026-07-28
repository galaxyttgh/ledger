import { Link } from 'react-router-dom';

interface Crumb {
  label: string;
  path?: string;
}

const Breadcrumb = ({ items }: { items: Crumb[] }) => {
  return (
    <nav className="flex items-center text-sm text-gray-500 mb-4">
      {items.map((item, i) => (
        <span key={i} className="flex items-center">
          {i > 0 && <span className="mx-2">/</span>}
          {item.path ? (
            <Link to={item.path} className="hover:text-blue-600 transition">{item.label}</Link>
          ) : (
            <span className="text-gray-800 font-medium">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
};

export default Breadcrumb;