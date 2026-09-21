// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { siteConfig } from "@/config/site.config";
import { InterviewPublicConsentModal } from "./interview-public-consent-modal";

function renderModal(
  overrides: { isSubmitting?: boolean; showOpenDataNotice?: boolean } = {}
) {
  const onSubmit = vi.fn();
  render(
    <InterviewPublicConsentModal
      open
      onOpenChange={vi.fn()}
      onSubmit={onSubmit}
      isSubmitting={overrides.isSubmitting ?? false}
      showOpenDataNotice={overrides.showOpenDataNotice ?? true}
    />
  );
  return { onSubmit };
}

describe("InterviewPublicConsentModal", () => {
  it("オープンデータ提供の告知とデータ利用規約リンクを表示する", () => {
    renderModal({ showOpenDataNotice: true });

    expect(
      screen.getByText(/第三者にオープンデータとして提供されることがあります/)
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", {
        name: `${siteConfig.siteName}AIインタビューデータ利用規約`,
      })
    ).toBeInTheDocument();
  });

  it("オープンデータ機能が無効なら告知と規約リンクを出さない", () => {
    renderModal({ showOpenDataNotice: false });

    expect(
      screen.queryByText(/第三者にオープンデータとして提供されることがあります/)
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", {
        name: `${siteConfig.siteName}AIインタビューデータ利用規約`,
      })
    ).not.toBeInTheDocument();
  });

  it("公開許可で onSubmit(true)、非公開で onSubmit(false) を呼ぶ", async () => {
    const user = userEvent.setup();
    const { onSubmit } = renderModal();

    await user.click(
      screen.getByRole("button", { name: /公開を許可して提出する/ })
    );
    expect(onSubmit).toHaveBeenCalledWith(true);

    await user.click(screen.getByRole("button", { name: "非公開で提出する" }));
    expect(onSubmit).toHaveBeenCalledWith(false);
  });

  it("送信中はボタンが無効化される", () => {
    renderModal({ isSubmitting: true });
    expect(screen.getByRole("button", { name: /送信中/ })).toBeDisabled();
  });
});
