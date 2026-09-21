"use client";

import { ArrowRight, LockOpen } from "lucide-react";
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

interface MakePublicModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isSubmitting: boolean;
  /**
   * オープンデータ提供（二次利用）の告知を出すか。
   * データ利用規約ページはオープンデータ機能が有効なときだけ公開されるため、既定値は設定に連動させる。
   */
  showOpenDataNotice?: boolean;
}

export function MakePublicModal({
  open,
  onOpenChange,
  onConfirm,
  isSubmitting,
  showOpenDataNotice = siteConfig.features.openData,
}: MakePublicModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="py-9">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-primary-accent text-center leading-relaxed">
            インタビュー内容を
            <br />
            公開に切り替えますか？
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-6">
          <ConsentCheckListItem>
            公開を許可した場合、今後{siteConfig.siteName}
            にあなたのご意見の要約とインタビュー原文が匿名で掲載されることがあります。
          </ConsentCheckListItem>
          {showOpenDataNotice && <OpenDataNoticeItem />}
          <ConsentCheckListItem>
            さまざまな意見が公開されることで、より深い議案議論が実現できます。
          </ConsentCheckListItem>
          <p className="text-sm text-black">
            {siteConfig.managingParty
              ? `非公開で提出した場合でも、ご意見は${siteConfig.managingParty}の政策検討に活用させていただきます。`
              : "非公開で提出した場合でも、ご意見は政策検討に活用させていただきます。"}
          </p>
        </div>

        <div className="space-y-3 mt-6">
          <Button
            onClick={onConfirm}
            disabled={isSubmitting}
            className="w-full"
          >
            <LockOpen className="mr-2 size-5" />
            {isSubmitting ? "変更中..." : "公開にする"}
            {!isSubmitting && <ArrowRight className="ml-2 size-5" />}
          </Button>
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
            className="w-full text-gray-500"
          >
            非公開のまま戻る
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
