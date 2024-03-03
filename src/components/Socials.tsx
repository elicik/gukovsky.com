import { SiGithub, SiLinkedin, SiGmail } from "@icons-pack/react-simple-icons";

import { Button } from "@/components/ui/button";

export default function Socials() {
    let socialMap = [
        {
            link: "http://www.github.com/elicik",
            Icon: SiGithub,
        },
        {
            link: "http://www.linkedin.com/in/elicik",
            Icon: SiLinkedin,
        },
        {
            link: "mailto:gukovskye@gmail.com",
            Icon: SiGmail,
        },
    ];
    return (
        <div className="flex justify-center">
            {socialMap.map(({ link, Icon }) => (
                <Button
                    asChild
                    className="h-20 w-20 mx-4 mt-6"
                    variant="outline"
                >
                    <a href={link}>
                        <Icon className="h-full w-full" color="default" />
                    </a>
                </Button>
            ))}
        </div>
    );
}
