import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
  FaCodepen,
  FaFacebook,
  FaLinkedin,
  FaStackOverflow,
  FaTwitch,
  FaYoutube,
} from "react-icons/fa";
import { HiOutlineLink } from "react-icons/hi";
import { IoLogoTwitter } from "react-icons/io";
import { PiDevToLogoFill, PiGithubLogoFill } from "react-icons/pi";
import { SiCodewars, SiGitlab, SiHashnode } from "react-icons/si";
import { LinkProps, useLinks } from "../../contexts/LinksContext";
import { getCorrespondingLogo, getRightProfileUrl } from "../../utils/helper";
import LinkPlatformItems from "./LinkPlatformItems";

const socialPlatforms = [
  {
    name: "Github",
    icon: <PiGithubLogoFill size={"1.6rem"} />,
    url: "https://github.com/",
  },
  {
    name: "Dev.to",
    icon: <PiDevToLogoFill size={"1.6rem"} />,
    url: "https://dev.to/",
  },
  {
    name: "Codewars",
    icon: <SiCodewars size={"1.6rem"} />,
    url: "https://www.codewars.com/users/",
  },
  {
    name: "Gitlab",
    icon: <SiGitlab size={"1.6rem"} />,
    url: "https://gitlab.com/",
  },
  {
    name: "Hashnode",
    icon: <SiHashnode size={"1.6rem"} />,
    url: "https://hashnode.com/@",
  },
  {
    name: "Twitter",
    icon: <IoLogoTwitter size={"1.6rem"} />,
    url: "https://twitter.com/",
  },
  {
    name: "LinkedIn",
    icon: <FaLinkedin size={"1.6rem"} />,
    url: "https://www.linkedin.com/in/",
  },
  {
    name: "YouTube",
    icon: <FaYoutube size={"1.6rem"} />,
    url: "https://www.youtube.com/@",
  },
  {
    name: "Facebook",
    icon: <FaFacebook size={"1.6rem"} />,
    url: "https://www.facebook.com/",
  },
  {
    name: "Twitch",
    icon: <FaTwitch size={"1.6rem"} />,
    url: "https://www.twitch.tv/",
  },
  {
    name: "Codepen",
    icon: <FaCodepen size={"1.6rem"} />,
    url: "https://codepen.io/",
  },
  {
    name: "StackOverflow",
    icon: <FaStackOverflow size={"1.6rem"} />,
    url: "https://stackoverflow.com/users/",
  },
];

export default function LinkItems({
  link,
  number,
  index,
  isCreating,
}: {
  link: LinkProps;
  number: number;
  index: number;
  isCreating: boolean;
}) {
  const { updateLink, deleteLink } = useLinks();
  const [links, setLinks] = useState(link.name);
  const [isLinkBoxOpen, setIsLinkBoxOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState(
    link.link || getRightProfileUrl(link.name)!,
  );

  function handlePlatformChange(
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) {
    event.preventDefault();
    event.stopPropagation();
    setIsLinkBoxOpen((prev) => !prev);
  }

  function handleUpdateLinkUrl(event: React.ChangeEvent<HTMLInputElement>) {
    const value = event.target.value;
    if (value.length >= getRightProfileUrl(link.name)!.length) {
      setLinkUrl(value);
      updateLink(index, { link: value, name: links });
    }
  }

  useEffect(() => {
    setLinkUrl(link.link || getRightProfileUrl(link.name)!);
    setLinks(link.name);
  }, [link]);

  return (
    <div className="mb-[2.4rem] rounded-[1.2rem] bg-[#fafafa] p-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h3 className="text-[1.6rem] font-bold leading-[2.4rem] text-[#737373]">
            Link #{number}
          </h3>
        </div>
        <p
          className="cursor-pointer text-[1.6rem] leading-[2.4rem] text-[#737373]"
          onClick={() => deleteLink(index)}
        >
          Remove
        </p>
      </div>

      <form className="flex flex-col gap-[1.2rem] pt-[1.2rem]">
        <div>
          <label
            htmlFor="platform"
            className="text-[1.2rem] leading-[1.8rem] text-[#333]"
          >
            Platform
          </label>

          <div className="relative">
            <button
              type="button"
              className="z-[999] flex w-full items-center gap-5 rounded-[0.8rem] border border-solid border-[#d9d9d9] bg-white px-6 py-5 text-[1.6rem] leading-[2.4rem] text-[#333] caret-[#633cff] outline-none focus:border-[#633cff] focus:shadow-purple-sh"
              onClick={handlePlatformChange}
            >
              {getCorrespondingLogo(link.name)}
              <p>{link.name}</p>
              <motion.img
                src="./icon-chevron-down.svg"
                alt="chevron down"
                className="ml-auto transition-none"
                initial={{ rotate: 0 }}
                animate={{ rotate: isLinkBoxOpen ? 180 : 0 }}
                exit={{ rotate: 0 }}
                transition={{
                  type: "spring",
                }}
              />
            </button>

            {isLinkBoxOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: 0.4,
                  ease: "easeInOut",
                  type: "spring",
                }}
                className="absolute top-[6rem] z-[3] flex h-[30rem] w-full flex-col gap-[1.2rem] overflow-y-scroll rounded-[0.8rem] border border-solid border-[#d9d9d9] bg-white p-[1.6rem] shadow-dark-sh"
              >
                <motion.div className="flex flex-col gap-[1.2rem]">
                  {socialPlatforms.map((platform) => (
                    <LinkPlatformItems
                      index={index}
                      name={platform.name}
                      icon={platform.icon}
                      key={platform.name}
                      setLinks={setLinks}
                      setIsLinkBoxOpen={setIsLinkBoxOpen}
                      links={links}
                      setLinkUrl={setLinkUrl}
                    />
                  ))}
                </motion.div>
              </motion.div>
            )}
          </div>
        </div>

        <div>
          <label
            htmlFor="link"
            className="text-[1.2rem] leading-[1.8rem] text-[#333]"
          >
            Link
          </label>
          <div className="relative flex">
            <HiOutlineLink
              size={"1.6rem"}
              className="absolute left-[2.5%] top-[40%] text-[#737373]"
            />
            <input
              type="text"
              placeholder="e.g. https://www.github.com/johnappleseed"
              id="link"
              value={linkUrl}
              onChange={handleUpdateLinkUrl}
              className="w-full rounded-[0.8rem] border border-solid border-[#d9d9d9] bg-white py-5 pl-[4rem] text-[1.6rem] leading-[2.4rem] text-[#333] caret-[#633cff] outline-none focus:border-[#633cff] focus:shadow-purple-sh disabled:cursor-not-allowed disabled:bg-[#ccc]"
              disabled={isCreating}
            />
            <p className="absolute right-[2.5%] top-[40%] hidden text-[1.2rem] leading-[1.8rem] text-[#ff3939]">
              cant't be empty
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}
