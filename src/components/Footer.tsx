export function Footer() {
  const categories = {
    "Web Development": [
      "JavaScript",
      "React",
      "Node.js",
      "Python",
      "TypeScript",
      "Angular",
      "Vue.js",
    ],
    "Data Science": [
      "Python",
      "R",
      "Machine Learning",
      "Deep Learning",
      "Statistics",
      "SQL",
      "Data Visualization",
    ],
    DevOps: ["Docker", "Kubernetes", "AWS", "CI/CD", "Jenkins", "Git", "Linux"],
    "Mobile Development": [
      "React Native",
      "Flutter",
      "iOS",
      "Android",
      "Kotlin",
      "Swift",
    ],
    "Cloud Computing": [
      "AWS",
      "Azure",
      "Google Cloud",
      "Cloud Architecture",
      "Serverless",
    ],
    Certifications: [
      "AWS Certified",
      "Google Cloud Certified",
      "Microsoft Certified",
      "CompTIA",
      "Cisco",
    ],
  };

  return (
    <footer className="bg-gray-900 text-white pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Object.entries(categories).map(([category, skills]) => (
            <div key={category}>
              <h3 className="text-lg font-semibold mb-4">{category}</h3>
              <ul className="space-y-2">
                {skills.map((skill) => (
                  <li
                    key={skill}
                    className="text-gray-400 hover:text-white cursor-pointer text-sm"
                  >
                    {skill}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 pt-8 border-t border-gray-800">
          <p className="text-center text-gray-400 text-sm">
            © {new Date().getFullYear()} E-Learning Platform. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
