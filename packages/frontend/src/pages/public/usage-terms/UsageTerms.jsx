import { useTranslation } from "react-i18next";
import { Title } from "../../shared/components/layout";

const UsageTerms = () => {
  const { t } = useTranslation("usageterms");
  return (
    <section className="flex flex-grow w-full">
       <div className="container mx-auto bg-background-50 p-4">
        <Title title={t("title")} />
        <p className="leading-normal mt-2">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus
          quis dui pellentesque, tincidunt nisl non, dignissim leo. Cras sit
          amet metus eleifend eros euismod cursus. Vestibulum consectetur
          posuere massa, ac egestas augue accumsan nec. Donec id sem ornare
          ligula gravida sagittis et quis urna. Aenean felis dolor, congue ut
          malesuada sit amet, tempor eget sem. Aenean auctor mollis nisi eget
          placerat. Ut volutpat finibus posuere. Proin sagittis cursus magna, id
          pharetra tortor varius at.
        </p>
        <p className="leading-normal mt-2">
          Proin tempor aliquam orci sed dapibus. Maecenas dui purus, auctor at
          turpis sed, venenatis rutrum nunc. Vivamus vel molestie arcu. Nam
          metus felis, accumsan id scelerisque sit amet, semper nec risus. Nam
          accumsan eros et sem iaculis gravida. Phasellus accumsan elementum
          justo ac hendrerit. Fusce nec justo nec lorem aliquam condimentum.
          Curabitur euismod urna ac nisl tincidunt, vel fermentum odio
          elementum. Praesent vestibulum sem vel convallis rhoncus. Nunc
          condimentum ligula non pellentesque maximus. Donec blandit sed magna
          id blandit. Aenean luctus in massa vel ornare. Cras aliquet eu justo
          at gravida.
        </p>
        <p className="leading-normal mt-2">
          Proin eu ipsum placerat, malesuada lorem ultrices, sagittis urna. Sed
          ut commodo lacus, eu efficitur augue. Curabitur sit amet mauris
          tincidunt, mollis velit ut, ultrices metus. Nullam nunc odio, finibus
          et libero id, tristique commodo tellus. Vivamus consectetur dolor
          pellentesque congue ornare. Vivamus quis orci augue. Curabitur sit
          amet est nibh. Morbi a quam at dui mollis ullamcorper. Maecenas mattis
          ex eget tellus ultrices luctus. Vivamus blandit at libero ut molestie.
          Praesent ullamcorper dictum sem, eget lobortis mi consectetur vel.
          Suspendisse ut suscipit ipsum, ac porttitor orci.
        </p>
        <p className="leading-normal mt-2">
          Vestibulum lectus tortor, condimentum et efficitur ut, hendrerit non
          mi. Ut luctus mauris quis ipsum semper sollicitudin. Mauris porta
          tempor sem, fermentum faucibus ligula egestas vel. Vestibulum tempor
          augue ac sapien suscipit sagittis. Donec molestie pellentesque mi, sed
          ultricies quam viverra sit amet. Quisque venenatis odio ut nibh
          feugiat viverra. Maecenas eu velit et lacus auctor efficitur. Nunc
          ligula dui, commodo eu accumsan id, sagittis non tortor.
        </p>
        <p className="leading-normal mt-2">
          Phasellus feugiat ut augue ac semper. Quisque et volutpat enim. Cras
          ut turpis sollicitudin, viverra nisi at, vestibulum urna. Nulla nec
          viverra est. Ut id lorem non justo eleifend pharetra. Curabitur vitae
          velit sed nisl dignissim auctor. Nulla viverra mattis diam sed
          sodales. Curabitur sit amet imperdiet metus, eget vehicula purus.
          Aliquam quis nulla in dolor dictum tristique sed et eros. Vivamus id
          arcu mauris. Duis malesuada sapien nulla. Pellentesque blandit est id
          nisl commodo egestas.
        </p>
      </div>
    </section>
  );
};

export default UsageTerms;
