
"use client";
import { useRouter, usePathname } from "next/navigation";

const pages = [
  { name: "Profile", path: "/profile" },
	{ name: "Preferences", path: "/preferences" },
	{ name: "Match", path: "/match" }
];

export default function PageSelector() {
	const router = useRouter();
	const pathname = usePathname();

	return (
		<nav className="fixed left-0 top-center z-50 flex flex-col items-start pt-8 pl-6 gap-2 select-none">
			{pages.map((page) => {
				const isActive = pathname === page.path || (page.path === "/" && pathname === "/match");
				return (
					<button
						key={page.path}
						onClick={() => router.push(page.path)}
						className={`
							transition-transform transition-colors duration-150 font-semibold
							text-gray-700
							uppercase tracking-wide
							focus:outline-none
							${isActive ? "text-2xl scale-110 text-gray-900" : "text-lg scale-100 hover:scale-125 hover:text-gray-900"}
						`}
						style={{
							background: "none",
							boxShadow: "none",
							padding: 0,
							marginBottom: "0.5rem",
							cursor: "pointer",
							opacity: isActive ? 1 : 0.7,
						}}
					>
						{page.name}
					</button>
				);
			})}
		</nav>
	);
}
