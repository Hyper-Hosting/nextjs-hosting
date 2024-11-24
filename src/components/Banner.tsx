import { env } from "@/data/env/client";

export function Banner({
  message,
  mappings,
  customizations,
  canRemoveBranding,
}: {
  canRemoveBranding: boolean;
  message: string;
  mappings: {
    coupon: string;
    discount: string;
    country: string;
  };
  customizations: {
    backgroundColor: string;
    textColor: string;
    fontSize: string;
    isSticky: boolean;
    classPrefix?: string | null;
  };
}) {
  const prefix = customizations.classPrefix ?? "";
  const mappedMessage = Object.entries(mappings).reduce(
    (mappedMessage, [key, value]) => {
      return mappedMessage.replace(new RegExp(`{${key}}`, "g"), value);
    },
    message.replace(/'/g, "&#39;")
  );

  return (
    <>
      <style type="text/css">
        {`
      .${prefix}easy-ppp-container {
          all: revert;
          display: flex;
          flex-direction: column;
          gap: .5rem;
          background-color: ${customizations.backgroundColor};
          color: ${customizations.textColor};
          font-size: ${customizations.fontSize};
          font-family: inherit;
          padding: 1rem;
          ${customizations.isSticky ? "position: sticky;" : ""}
          left: 0;
          right: 0;
          top: 0;
          text-wrap: balance;
          text-align: center;
      }

      .${prefix}easy-ppp-branding {
        color: inherit;
        font-size: inherit;
        display: inline-block;
        text-decoration: underline;
      }
      `}
      </style>
      <div className={`${prefix}easy-ppp-container ${prefix}easy-ppp-override`}>
        <span
          className={`${prefix}easy-ppp-message ${prefix}easy-ppp-override`}
          dangerouslySetInnerHTML={{
            __html: mappedMessage,
          }}
        />
        {!canRemoveBranding && (
          <a
            className={`${prefix}easy-ppp-branding`}
            href={`${env.NEXT_PUBLIC_SERVER_URL}`}
          >
            Powered by Easy PPP
          </a>
        )}
      </div>
    </>
  );
}
