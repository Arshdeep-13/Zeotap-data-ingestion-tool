"use client";

import { Chip } from "@nextui-org/chip";
import { Badge, Progress } from "@nextui-org/react";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { slide as Menu } from "react-burger-menu";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AnimatedLink from "./AnimatedLink";
import Loading from "./Loading";

const NavBar = () => {
  const pathname = usePathname();
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loader, setLoader] = useState(false);
  const [showLinks, setShowLinks] = useState(true);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleLinkClick = () => {
    setMenuOpen(false);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
      setMenuOpen(false);
    }
  };

  {
    loader && <Loading />;
  }
  return (
    <nav className="fixed top-0 left-0 w-screen bg-black shadow-[0_4px_8px_rgba(255,255,255,0.2)] z-50 p-0 md:p-4">
      <div className="mx-auto flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center space-x-3 rtl:space-x-reverse"
        >
          <motion.span
            className="self-center text-2xl font-semibold whitespace-nowrap text-white"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeInOut" }}
          >
            Data Ingestion Tool
          </motion.span>
        </Link>
        {showLinks && (
          <div className="hidden xl:flex xl:items-center xl:space-x-8 max-w-">
            <AnimatedLink title="Home" href="/" />
            <AnimatedLink title="Connect" href="/connect" />
            <AnimatedLink title="Add Data" href="/import" />
            <AnimatedLink title="Export Data" href="/export" />
            <AnimatedLink title="Read Data" href="/read" />
          </div>
        )}

        {/* Hamburger Menu: Visible at 1100px or less */}
        {showLinks && (
          <div className="xl:hidden">
            <Menu
              right
              isOpen={isMenuOpen}
              onStateChange={({ isOpen }) => setMenuOpen(isOpen)}
              className="bm-menu"
              styles={{
                bmBurgerBars: {
                  background: "#fff",
                  width: "2rem",
                  height: "0.3rem",
                  position: "absolute",
                  left: "90%",
                  margin: "0",
                  padding: "0",
                },
                bmCross: {
                  background: "#fff",
                },
                bmItemList: {
                  padding: "1rem",
                },
              }}
            >
              <Link
                href="/"
                className="block mt-20 hover:text-blue-700"
                onClick={handleLinkClick}
              >
                Home
              </Link>
              <Link
                href="/connect"
                className="block hover:text-blue-700"
                onClick={handleLinkClick}
              >
                Connect
              </Link>
              <Link
                href="/import"
                className="block hover:text-blue-700"
                onClick={handleLinkClick}
              >
                Add Data
              </Link>
              <Link
                href="/export"
                className="block hover:text-blue-700"
                onClick={handleLinkClick}
              >
                Export Data
              </Link>
              <Link
                href="/read"
                className="block hover:text-blue-700"
                onClick={handleLinkClick}
              >
                Read Data
              </Link>
            </Menu>
          </div>
        )}
      </div>
    </nav>
  );
};

export default NavBar;
