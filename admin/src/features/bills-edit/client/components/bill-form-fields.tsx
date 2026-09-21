"use client";

import { AlertTriangle } from "lucide-react";
import { type Control, useFormContext, useWatch } from "react-hook-form";
import { Checkbox } from "@/components/ui/checkbox";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { siteConfig } from "@/config/site.config";
import type { BillStatus } from "@/features/bills/shared/types";
import type { Committee } from "@/features/committees/shared/types";
import type { CouncilSession } from "@/features/council-sessions/shared/types";
import type { BillCreateInput } from "../../shared/types";
import { shouldAutoCloseInterviewOnBillStatus } from "../../shared/utils/should-auto-close-interview";
import { GenerateThumbnailButton } from "./generate-thumbnail-button";
import { ThumbnailUpload } from "./thumbnail-upload";

const BILL_STATUS_OPTIONS: Array<{ value: BillStatus; label: string }> = [
  { value: "preparing", label: "議案上程前" },
  { value: "submitted", label: "上程済み" },
  { value: "in_committee", label: "委員会審査中" },
  { value: "plenary_session", label: "本会議採決中" },
  { value: "approved", label: "可決" },
  { value: "rejected", label: "否決" },
  { value: "reported", label: "専決処分報告" },
];

interface BillFormFieldsProps {
  control: Control<BillCreateInput>;
  billId?: string;
  councilSessions: CouncilSession[];
  committees: Committee[];
}

export function BillFormFields({
  control,
  billId,
  councilSessions,
  committees,
}: BillFormFieldsProps) {
  const { setValue } = useFormContext<BillCreateInput>();
  const billName = useWatch({ control, name: "name" });
  const thumbnailUrl = useWatch({ control, name: "thumbnail_url" });
  const shareThumbnailUrl = useWatch({
    control,
    name: "share_thumbnail_url",
  });

  return (
    <>
      <FormField
        control={control}
        name="bill_number"
        render={({ field }) => (
          <FormItem>
            <FormLabel>議案番号 *</FormLabel>
            <FormControl>
              <Input {...field} value={field.value ?? ""} />
            </FormControl>
            <FormDescription>
              議案番号を入力してください（例:「第1号」「報告第1号」）。未設定の場合は空白のままにしてください。
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>議案名 *</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormDescription>
              議案の正式名称を入力してください（最大200文字）
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="status"
        render={({ field }) => (
          <FormItem>
            <FormLabel>ステータス *</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="ステータスを選択" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {BILL_STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormDescription>現在の審議状況を選択してください</FormDescription>
            {shouldAutoCloseInterviewOnBillStatus(field.value) && (
              <p className="text-sm text-amber-700 bg-amber-50 p-3 rounded flex items-start gap-2">
                <AlertTriangle className="size-4 mt-0.5 shrink-0" />
                <span>
                  保存すると、この議案に紐づく公開中のインタビューは自動でクローズされます。
                </span>
              </p>
            )}
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="status_note"
        render={({ field }) => (
          <FormItem>
            <FormLabel>ステータス備考</FormLabel>
            <FormControl>
              <Textarea
                {...field}
                value={field.value || ""}
                className="min-h-[100px]"
              />
            </FormControl>
            <FormDescription>
              審議状況の詳細や補足情報を入力してください（最大500文字）
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="submitted_date"
        render={({ field }) => (
          <FormItem>
            <FormLabel>議案提出日</FormLabel>
            <FormControl>
              <Input type="date" {...field} />
            </FormControl>
            <FormDescription>
              議案の提出日を設定してください（任意）
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="thumbnail_url"
        render={({ field }) => (
          <FormItem>
            <FormLabel>サムネイル画像</FormLabel>
            <FormControl>
              <ThumbnailUpload
                value={field.value}
                onChange={field.onChange}
                billId={billId}
              />
            </FormControl>
            <FormDescription>
              議案のサムネイル画像を設定してください（任意）
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormItem>
        <FormDescription>
          議案名からAIでサムネイル画像を自動生成します。生成した画像はサムネイルとOGP画像の両方に設定されます。
        </FormDescription>
        <GenerateThumbnailButton
          billId={billId}
          billName={billName}
          currentThumbnailUrl={thumbnailUrl}
          currentShareThumbnailUrl={shareThumbnailUrl}
          onGenerated={(url) => {
            setValue("thumbnail_url", url);
            setValue("share_thumbnail_url", url);
          }}
        />
      </FormItem>

      <FormField
        control={control}
        name="share_thumbnail_url"
        render={({ field }) => (
          <FormItem>
            <FormLabel>シェア用OGP画像</FormLabel>
            <FormControl>
              <ThumbnailUpload
                value={field.value}
                onChange={field.onChange}
                billId={billId}
                storagePrefix="share"
              />
            </FormControl>
            <FormDescription>
              Twitter等のSNSでシェアされた際に表示される画像を設定してください（任意）。設定しない場合はサムネイル画像が使用されます。
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="committee_id"
        render={({ field }) => (
          <FormItem>
            <FormLabel>委員会</FormLabel>
            <Select
              onValueChange={(v) => field.onChange(v === "__none__" ? null : v)}
              value={field.value ?? "__none__"}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="委員会を選択" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="__none__">なし</SelectItem>
                {committees
                  .filter((c) => c.is_active)
                  .map((committee) => (
                    <SelectItem key={committee.id} value={committee.id}>
                      {committee.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <FormDescription>
              審査を担当する委員会を選択してください（任意）
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="slug"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Slug</FormLabel>
            <FormControl>
              <Input
                {...field}
                value={field.value || ""}
                placeholder="r8-1-gian-1"
              />
            </FormControl>
            <FormDescription>
              コンテンツ同期用の識別子です（最大200文字）
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="council_session_id"
        render={({ field }) => (
          <FormItem>
            <FormLabel>定例会</FormLabel>
            <Select
              onValueChange={field.onChange}
              value={field.value ?? undefined}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="定例会を選択" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {councilSessions.map((session) => (
                  <SelectItem key={session.id} value={session.id}>
                    {session.name}（{session.start_date}〜{session.end_date}）
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormDescription>
              議案が上程された定例会を選択してください
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="pdf_url"
        render={({ field }) => (
          <FormItem>
            <FormLabel>議案PDF URL</FormLabel>
            <FormControl>
              <Input
                type="url"
                placeholder={`${siteConfig.councilBaseUrl}...`}
                {...field}
                value={field.value ?? ""}
              />
            </FormControl>
            <FormDescription>
              議案PDFのURLを入力してください（任意）。Web検索補完時にPDFの内容を参照します。
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="is_featured"
        render={({ field }) => (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel>注目の議案</FormLabel>
              <FormDescription>
                トップページなどで優先的に表示されます
              </FormDescription>
            </div>
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="is_review_completed"
        render={({ field }) => (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel>記事レビュー完了</FormLabel>
              <FormDescription>
                未完了の場合、記事にレビュー中バナーが表示されます
              </FormDescription>
            </div>
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="knowledge_source"
        render={({ field }) => (
          <FormItem>
            <FormLabel>ナレッジソース</FormLabel>
            <FormControl>
              <Textarea
                {...field}
                value={field.value ?? ""}
                placeholder="議案の補足情報や独自の仮説などを入力"
                className="min-h-[200px] resize-y"
              />
            </FormControl>
            <FormDescription>
              AIインタビュー（常時参照）と、AIチャット（下のトグルで参照可否を切替）で使われる補足情報です。最大40,000文字。
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="use_knowledge_source_in_chat"
        render={({ field }) => (
          <FormItem className="flex flex-row items-start gap-3 space-y-0 rounded-md border p-4">
            <FormControl>
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel>AIチャットでもナレッジソースを使用する</FormLabel>
              <FormDescription>
                ONにすると、議案ページのAIチャットのシステムプロンプトに上のナレッジソースが追加されます。AIインタビューでは常に使用されます。
              </FormDescription>
            </div>
          </FormItem>
        )}
      />
    </>
  );
}
