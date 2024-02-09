import { Whatsapp, Facebook, Instagram, Threads, Twitter, Youtube, Linkedin } from '../icons';

const Social = ({ className }) => {

  const icons = {
    Whatsapp: <Whatsapp />,
    Facebook: <Facebook />,
    Instagram: <Instagram />,
    Threads: <Threads />,
    Twitter: <Twitter />,
    Youtube: <Youtube />,
    Linkedin: <Linkedin />
  };

  const SocialItem = ({ name, linkTo }) => {
    const Icon = icons[name];
    if (!Icon) return null;

    return (
      <a href={linkTo} target='_blank' rel='noopener noreferrer' aria-label={name}>
        <div className='mx-2 hover:text-white hover:cursor-pointer'>{Icon}</div>
      </a>
    );
  };

  return (
    <div className={`flex justify-center ${className ? className : ''}`}>
      <SocialItem name='Whatsapp' linkTo='https://wa.me/5547997014984' />
      <SocialItem name='Facebook' linkTo='https://www.facebook.com/touchpostos' />
      <SocialItem name='Instagram' linkTo='https://instagram.com/touchpostos' />
      {/* <SocialItem name='Threads' linkTo='https://www.threads.net/@touchsistemas_postos' /> */}
      <SocialItem name='Twitter' linkTo='https://x.com/@touchpostos' />
      <SocialItem name='Youtube' linkTo='https://www.youtube.com/@touchpostos' />
      <SocialItem name='Linkedin' linkTo='https://www.linkedin.com/company/touchpostos' />
    </div>
  );
};

export default Social;
