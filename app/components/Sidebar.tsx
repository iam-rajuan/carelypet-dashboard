"use client";

import { useState, useEffect, Children } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  LayoutDashboard,
  BarChart2,
  Bell,
  PawPrint,
  ChevronDown,
  Users,
  Handshake,
  ReceiptText,
  BookLock,
  FileText,
  Settings,
  UserCircle,
  LogOut,
  Dog,
} from "lucide-react";

// MENU CONFIG (DRY)
const MENU = [
  {
    label: "MAIN",
    items: [
      {
        label: "Dashboard",
        icon: LayoutDashboard,
        href: "/dashboard/dashboard",
      },
      { label: "Analytics", icon: BarChart2, href: "/dashboard/analytics" },
      { label: "Notifications", icon: Bell, href: "/dashboard/notifications" },
    ],
  },

  {
    label: "CORE",
    items: [
      {
        label: "Pet",
        icon: PawPrint,
        href: "/dashboard/pet",
        children: [
          { label: "Pet Type", href: "/dashboard/pet-type" },
          { label: "Pet Breed", href: "/dashboard/pet-breed" },
        ],
      },
      {
        label: "Pet's Pal Management",
        icon: Users,
        href: "/dashboard/pal-management",
      },
      {
        label: "Service Management",
        icon: Handshake,
        href: "/dashboard/service-management",
      },
      {
        label: "Adoption Management",
        icon: Dog,
        href: "/dashboard/adoption",
        children: [
          { label: "Adoption List", href: "/dashboard/adoption-list" },
          { label: "Adoption Request", href: "/dashboard/adoption-requests" },
        ],
      },
      { label: "Report", icon: FileText, href: "/dashboard/report" },
      {
        label: "Terms & Conditions",
        icon: ReceiptText,
        href: "/dashboard/terms-conditions",
      },
      {
        label: "Privacy Policy",
        icon: BookLock,
        href: "/dashboard/privacy-policy",
      },
      { label: "Settings", icon: Settings, href: "/dashboard/settings" },
    ],
  },

  {
    label: "PERSONAL INFORMATION",
    items: [
      { label: "Profile", icon: UserCircle, href: "/dashboard/profile" },
      { label: "Logout", icon: LogOut, href: "/dashboard/logout" },
    ],
  },
];

export default function Sidebar({ collapsed }: { collapsed: boolean }) {
  const pathname = usePathname();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  // auto-open parent dropdown if active
  useEffect(() => {
    MENU.forEach((section) => {
      section.items.forEach((item) => {
        if (item.children) {
          if (pathname.startsWith(item.href)) {
            setOpenDropdown(item.label);
          }
        }
      });
    });
  }, [pathname]);

  const isActive = (route: string) => pathname.startsWith(route);

  return (
    <aside
      className={`h-screen bg-white border-r border-gray-200 fixed left-0 top-0 transition-all duration-300 flex flex-col ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Logo */}
      <div className="flex items-center justify-center px-6 py-6">
        {collapsed ? (
          <Image src="/logo/icon_logo.svg" alt="logo" width={30} height={30} />
        ) : (
          <Image src="/logo/logo.svg" alt="logo" width={140} height={30} />
        )}
      </div>

      <div className="px-4 pt-2 space-y-4 overflow-y-auto flex-1">
        {MENU.map((section) => (
          <div key={section.label}>
            {!collapsed && (
              <p className="text-[11px] font-semibold text-gray-400 uppercase">
                {section.label}
              </p>
            )}

            <div className="mt-2 space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;

                // ITEM HAS SUBMENU
                if (item.children) {
                  const open = openDropdown === item.label;

                  return (
                    <div key={item.label}>
                      <button
                        onClick={() =>
                          setOpenDropdown(open ? null : item.label)
                        }
                        className={`w-full flex items-center justify-between py-2.5 rounded-md transition ${
                          isActive(item.href)
                            ? "bg-[#00A7C7]"
                            : "hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex items-center px-3 gap-3">
                          <Icon
                            className={`h-5 w-5 ${
                              isActive(item.href)
                                ? "text-white"
                                : "text-gray-700"
                            }`}
                          />
                          {!collapsed && (
                            <span
                              className={`text-[15px] ${
                                isActive(item.href)
                                  ? "text-white"
                                  : "text-gray-800"
                              }`}
                            >
                              {item.label}
                            </span>
                          )}
                        </div>

                        {!collapsed && (
                          <ChevronDown
                            className={`h-4 w-4 transition-transform ${
                              open ? "rotate-180" : "text-gray-700"
                            }`}
                          />
                        )}
                      </button>

                      {/* Dropdown Animation */}
                      <div
                        className={`overflow-hidden transition-all duration-300 ${
                          open && !collapsed ? "max-h-40 mt-2" : "max-h-0"
                        }`}
                      >
                        <div className="ml-8 flex flex-col gap-1">
                          {item.children.map((child) => (
                            <Link
                              key={child.label}
                              href={child.href}
                              className={`py-1.5 text-[14px] rounded-md transition ${
                                isActive(child.href)
                                  ? "text-gray-700 bg-[#00a7c7]/30 pl-2 font-medium"
                                  : "text-gray-600 hover:text-[#00A7C7] hover:bg-gray-50"
                              }`}
                            >
                              {child.label}
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                }

                // SINGLE MENU ITEM
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`flex items-center gap-3 py-4 pl-3 rounded-xl transition ${
                      isActive(item.href)
                        ? "bg-[#00A7C7] text-[#00A7C7] font-medium"
                        : "hover:bg-gray-50 text-gray-700"
                    }`}
                  >
                    <Icon
                      className={`h-5 w-5 ${
                        isActive(item.href) ? "text-white" : ""
                      }`}
                    />
                    {!collapsed && (
                      <span
                        className={`text-[15px] ${
                          isActive(item.href) ? "text-white" : "text-gray-800"
                        }`}
                      >
                        {item.label}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
