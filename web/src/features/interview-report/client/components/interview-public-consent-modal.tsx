"use client";

import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { siteConfig } from "@/config/site.config";
import {
  ConsentCheckListItem,
  OpenDataNoticeItem,
} from "./consent-check-list-item";

interface InterviewPublicConsentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (isPublic: boolean) => void;
  isSubmitting: boolean;
  /**
   * オープンデータ提供（二次利用）の告知を出すか。
   * データ利用規約ページはオープンデータ機能が有効なときだけ公開されるため、既定値は設定に連動させる。
   */
  showOpenDataNotice?: boolean;
}

export function InterviewPublicConsentModal({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting,
  showOpenDataNotice = siteConfig.features.openData,
}: InterviewPublicConsentModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="py-9">
        <DialogHeader>
          <p className="text-center text-primary-accent font-bold">
            あと少しです！
          </p>
          <DialogTitle className="text-[22px] font-bold text-center">
            公開設定
          </DialogTitle>
          <div className="h-[1px] bg-mirai-gradient mt-4" />
        </DialogHeader>

        <div className="space-y-6 mt-6">
          <h3 className="text-lg font-bold text-primary-accent text-center leading-relaxed">
            インタビュー内容の公開を
            <br />
            許可しますか？
          </h3>

          <div className="space-y-4">
            <ConsentCheckListItem>
              公開を許可した場合、今後{siteConfig.siteName}
              にあなたのご意見の要約とインタビュー原文が匿名で掲載されることがあります。
            </ConsentCheckListItem>
            {showOpenDataNotice && <OpenDataNoticeItem />}
            <ConsentCheckListItem>
              さまざまな意見が公開されることで、より深い議案議論が実現できます。
            </ConsentCheckListItem>
          </div>

          <p className="text-sm text-black">
            {siteConfig.managingParty
              ? `非公開で提出した場合でも、ご意見は${siteConfig.managingParty}の政策検討に活用させていただきます。`
              : "非公開で提出した場合でも、ご意見は政策検討に活用させていただきます。"}
          </p>
        </div>

        <div className="space-y-3 mt-6">
          <Button
            onClick={() => onSubmit(true)}
            disabled={isSubmitting}
            className="w-full"
          >
            {isSubmitting ? "送信中..." : "公開を許可して提出する"}
            {!isSubmitting && <ArrowRight className="ml-2 size-5" />}
          </Button>
          <Button
            variant="ghost"
            onClick={() => onSubmit(false)}
            disabled={isSubmitting}
            className="w-full text-gray-500"
          >
            非公開で提出する
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
