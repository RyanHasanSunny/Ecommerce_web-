import PropTypes from 'prop-types';

const MainContainer = ({ title, breadcrumbs = [], children }) => {
  return (
    <div className="flex-1 p-8" style={{ backgroundColor: '#f9fafb', minHeight: '100%' }}>
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
        <nav className="mt-2">
          <ol className="flex text-sm text-gray-500 space-x-2">
            {breadcrumbs.length > 0 ? (
              breadcrumbs.map((crumb, idx) => (
                <li key={idx} className="flex items-center">
                  {idx > 0 && <span className="mx-1">/</span>}
                  {crumb.link ? (
                    <a href={crumb.link} className="hover:underline text-blue-600">
                      {crumb.label}
                    </a>
                  ) : (
                    <span>{crumb.label}</span>
                  )}
                </li>
              ))
            ) : (
              <li className="text-gray-600">{title}</li>
            )}
          </ol>
        </nav>
      </div>
      <div>{children}</div>
    </div>
  );
};

MainContainer.propTypes = {
  title: PropTypes.string.isRequired,
  breadcrumbs: PropTypes.array,  // Ensures breadcrumbs is an array
  children: PropTypes.node.isRequired,  // Ensures children are passed correctly
};

export default MainContainer;
