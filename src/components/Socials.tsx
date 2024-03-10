import { SiGithub, SiLinkedin, SiGmail } from "@icons-pack/react-simple-icons";

import { Button } from "@/components/ui/button";

export default function Socials() {
    let socialMap = [
        {
            name: "Github",
            link: "http://www.github.com/elicik",
            Icon: SiGithub,
        },
        {
            name: "LinkedIn",
            link: "http://www.linkedin.com/in/elicik",
            Icon: SiLinkedin,
        },
        {
            name: "Email",
            link: "mailto:gukovskye@gmail.com",
            Icon: SiGmail,
        },
    ];
    return (
        <div className="flex justify-center">
            {socialMap.map(({ name, link, Icon }) => (
                <Button
                    asChild
                    className="mx-4 mt-6 h-20 w-20"
                    variant="outline"
                    key={name}
                >
                    <a href={link}>
                        <Icon className="h-full w-full" color="default" />
                    </a>
                </Button>
            ))}
        </div>
    );
}
