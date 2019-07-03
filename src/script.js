import { library, dom} from "@fortawesome/fontawesome-svg-core";

// Desktop and Mobile
import { faDesktop } from "@fortawesome/free-solid-svg-icons";
import { faMobileAlt } from "@fortawesome/free-solid-svg-icons";

// Technologies
import { faVuejs } from "@fortawesome/free-brands-svg-icons";
import { faJs } from "@fortawesome/free-brands-svg-icons";

// Social Media
import { faGithub } from "@fortawesome/free-brands-svg-icons";
import { faLinkedin } from "@fortawesome/free-brands-svg-icons";
import { faEnvelope } from "@fortawesome/free-regular-svg-icons";

library.add(faDesktop, faMobileAlt);
library.add(faVuejs, faJs);
library.add(faGithub, faLinkedin, faEnvelope)

dom.watch()