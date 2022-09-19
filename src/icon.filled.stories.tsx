// import { action } from "@storybook/addon-actions";
// import { JSX, Component } from "solid-js";

import {
  AccountBookFilled,
  AlertFilled,
  AlipayCircleFilled,
  AlipaySquareFilled,
  AliwangwangFilled,
  AmazonCircleFilled,
  AmazonSquareFilled,
  AndroidFilled,
  ApiFilled,
  AppleFilled,
  AppstoreFilled,
  AudioFilled,
  BackwardFilled,
  BankFilled,
  BehanceCircleFilled,
  BehanceSquareFilled,
  BellFilled,
  BookFilled,
  BoxPlotFilled,
  BugFilled,
  BuildFilled,
  BulbFilled,
  CalculatorFilled,
  CalendarFilled,
  CameraFilled,
  CarFilled,
  CaretDownFilled,
  CaretLeftFilled,
  CaretRightFilled,
  CaretUpFilled,
  CarryOutFilled,
  CheckCircleFilled,
  CheckSquareFilled,
  ChromeFilled,
  CiCircleFilled,
  ClockCircleFilled,
  CloseCircleFilled,
  CloseSquareFilled,
  CloudFilled,
  CodeFilled,
  CodeSandboxCircleFilled,
  CodeSandboxSquareFilled,
  CodepenCircleFilled,
  CodepenSquareFilled,
  CompassFilled,
  ContactsFilled,
  ContainerFilled,
  ControlFilled,
  CopyFilled,
  CopyrightCircleFilled,
  CreditCardFilled,
  CrownFilled,
  CustomerServiceFilled,
  DashboardFilled,
  DatabaseFilled,
  DeleteFilled,
  DiffFilled,
  DingtalkCircleFilled,
  DingtalkSquareFilled,
  DislikeFilled,
  DollarCircleFilled,
  DownCircleFilled,
  DownSquareFilled,
  DribbbleCircleFilled,
  DribbbleSquareFilled,
  DropboxCircleFilled,
  DropboxSquareFilled,
  EditFilled,
  EnvironmentFilled,
  EuroCircleFilled,
  ExclamationCircleFilled,
  ExperimentFilled,
  EyeFilled,
  EyeInvisibleFilled,
  FacebookFilled,
  FastBackwardFilled,
  FastForwardFilled,
  FileAddFilled,
  FileExcelFilled,
  FileExclamationFilled,
  FileFilled,
  FileImageFilled,
  FileMarkdownFilled,
  FilePdfFilled,
  FilePptFilled,
  FileTextFilled,
  FileUnknownFilled,
  FileWordFilled,
  FileZipFilled,
  FilterFilled,
  FireFilled,
  FlagFilled,
  FolderAddFilled,
  FolderFilled,
  FolderOpenFilled,
  FormatPainterFilled,
  ForwardFilled,
  FrownFilled,
  FundFilled,
  FunnelPlotFilled,
  GiftFilled,
  GithubFilled,
  GitlabFilled,
  GoldFilled,
  GoldenFilled,
  GoogleCircleFilled,
  GooglePlusCircleFilled,
  GooglePlusSquareFilled,
  GoogleSquareFilled,
  HddFilled,
  HeartFilled,
  HighlightFilled,
  HomeFilled,
  HourglassFilled,
  Html5Filled,
  IdcardFilled,
  IeCircleFilled,
  IeSquareFilled,
  InfoCircleFilled,
  InstagramFilled,
  InsuranceFilled,
  InteractionFilled,
  LayoutFilled,
  LeftCircleFilled,
  LeftSquareFilled,
  LikeFilled,
  LinkedinFilled,
  LockFilled,
  MacCommandFilled,
  MailFilled,
  MedicineBoxFilled,
  MediumCircleFilled,
  MediumSquareFilled,
  MehFilled,
  MessageFilled,
  MinusCircleFilled,
  MinusSquareFilled,
  MobileFilled,
  MoneyCollectFilled,
  NotificationFilled,
  PauseCircleFilled,
  PayCircleFilled,
  PhoneFilled,
  PictureFilled,
  PieChartFilled,
  PlayCircleFilled,
  PlaySquareFilled,
  PlusCircleFilled,
  PlusSquareFilled,
  PoundCircleFilled,
  PrinterFilled,
  ProfileFilled,
  ProjectFilled,
  PropertySafetyFilled,
  PushpinFilled,
  QqCircleFilled,
  QqSquareFilled,
  QuestionCircleFilled,
  ReadFilled,
  ReconciliationFilled,
  RedEnvelopeFilled,
  RedditCircleFilled,
  RedditSquareFilled,
  RestFilled,
  RightCircleFilled,
  RightSquareFilled,
  RobotFilled,
  RocketFilled,
  SafetyCertificateFilled,
  SaveFilled,
  ScheduleFilled,
  SecurityScanFilled,
  SettingFilled,
  ShopFilled,
  ShoppingFilled,
  SignalFilled,
  SketchCircleFilled,
  SketchSquareFilled,
  SkinFilled,
  SkypeFilled,
  SlackCircleFilled,
  SlackSquareFilled,
  SlidersFilled,
  SmileFilled,
  SnippetsFilled,
  SoundFilled,
  StarFilled,
  StepBackwardFilled,
  StepForwardFilled,
  StopFilled,
  SwitcherFilled,
  TabletFilled,
  TagFilled,
  TagsFilled,
  TaobaoCircleFilled,
  TaobaoSquareFilled,
  ThunderboltFilled,
  ToolFilled,
  TrademarkCircleFilled,
  TrophyFilled,
  TwitterCircleFilled,
  TwitterSquareFilled,
  UnlockFilled,
  UpCircleFilled,
  UpSquareFilled,
  UsbFilled,
  VideoCameraFilled,
  WalletFilled,
  WarningFilled,
  WechatFilled,
  WeiboCircleFilled,
  WeiboSquareFilled,
  WindowsFilled,
  YahooFilled,
  YoutubeFilled,
  YuqueFilled,
  ZhihuCircleFilled,
  ZhihuSquareFilled
} from "@ant-design/icons";

export default {
  title: "General/Icon",
  // component: ZoomOutOutlined,
  parameters: { layout: "centered" },
  decorators: [
    (Story: any) => (
      <>
        <style>{`body .anticon {padding: 0.2em;}`}</style>
        <div style={{ display: "flex", "justify-content": "center", width: "90vw" }}>
          <Story />
        </div>
      </>
    ),
  ],
  argTypes: {
    size: {
      control: { type: "select" },
      options: ["xs", "sm", "md", "lg", "xl"],
    },
    children: {
      control: "text",
    },
  },
  args: {
    size: "md",
    children: "Button",
  },
};

export const Filled = (args: any) => <div>
  <AccountBookFilled />
  <AlertFilled />
  <AlipayCircleFilled />
  <AlipaySquareFilled />
  <AliwangwangFilled />
  <AmazonCircleFilled />
  <AmazonSquareFilled />
  <AndroidFilled />
  <ApiFilled />
  <AppleFilled />
  <AppstoreFilled />
  <AudioFilled />
  <BackwardFilled />
  <BankFilled />
  <BehanceCircleFilled />
  <BehanceSquareFilled />
  <BellFilled />
  <BookFilled />
  <BoxPlotFilled />
  <BugFilled />
  <BuildFilled />
  <BulbFilled />
  <CalculatorFilled />
  <CalendarFilled />
  <CameraFilled />
  <CarFilled />
  <CaretDownFilled />
  <CaretLeftFilled />
  <CaretRightFilled />
  <CaretUpFilled />
  <CarryOutFilled />
  <CheckCircleFilled />
  <CheckSquareFilled />
  <ChromeFilled />
  <CiCircleFilled />
  <ClockCircleFilled />
  <CloseCircleFilled />
  <CloseSquareFilled />
  <CloudFilled />
  <CodeFilled />
  <CodeSandboxCircleFilled />
  <CodeSandboxSquareFilled />
  <CodepenCircleFilled />
  <CodepenSquareFilled />
  <CompassFilled />
  <ContactsFilled />
  <ContainerFilled />
  <ControlFilled />
  <CopyFilled />
  <CopyrightCircleFilled />
  <CreditCardFilled />
  <CrownFilled />
  <CustomerServiceFilled />
  <DashboardFilled />
  <DatabaseFilled />
  <DeleteFilled />
  <DiffFilled />
  <DingtalkCircleFilled />
  <DingtalkSquareFilled />
  <DislikeFilled />
  <DollarCircleFilled />
  <DownCircleFilled />
  <DownSquareFilled />
  <DribbbleCircleFilled />
  <DribbbleSquareFilled />
  <DropboxCircleFilled />
  <DropboxSquareFilled />
  <EditFilled />
  <EnvironmentFilled />
  <EuroCircleFilled />
  <ExclamationCircleFilled />
  <ExperimentFilled />
  <EyeFilled />
  <EyeInvisibleFilled />
  <FacebookFilled />
  <FastBackwardFilled />
  <FastForwardFilled />
  <FileAddFilled />
  <FileExcelFilled />
  <FileExclamationFilled />
  <FileFilled />
  <FileImageFilled />
  <FileMarkdownFilled />
  <FilePdfFilled />
  <FilePptFilled />
  <FileTextFilled />
  <FileUnknownFilled />
  <FileWordFilled />
  <FileZipFilled />
  <FilterFilled />
  <FireFilled />
  <FlagFilled />
  <FolderAddFilled />
  <FolderFilled />
  <FolderOpenFilled />
  <FormatPainterFilled />
  <ForwardFilled />
  <FrownFilled />
  <FundFilled />
  <FunnelPlotFilled />
  <GiftFilled />
  <GithubFilled />
  <GitlabFilled />
  <GoldFilled />
  <GoldenFilled />
  <GoogleCircleFilled />
  <GooglePlusCircleFilled />
  <GooglePlusSquareFilled />
  <GoogleSquareFilled />
  <HddFilled />
  <HeartFilled />
  <HighlightFilled />
  <HomeFilled />
  <HourglassFilled />
  <Html5Filled />
  <IdcardFilled />
  <IeCircleFilled />
  <IeSquareFilled />
  <InfoCircleFilled />
  <InstagramFilled />
  <InsuranceFilled />
  <InteractionFilled />
  <LayoutFilled />
  <LeftCircleFilled />
  <LeftSquareFilled />
  <LikeFilled />
  <LinkedinFilled />
  <LockFilled />
  <MacCommandFilled />
  <MailFilled />
  <MedicineBoxFilled />
  <MediumCircleFilled />
  <MediumSquareFilled />
  <MehFilled />
  <MessageFilled />
  <MinusCircleFilled />
  <MinusSquareFilled />
  <MobileFilled />
  <MoneyCollectFilled />
  <NotificationFilled />
  <PauseCircleFilled />
  <PayCircleFilled />
  <PhoneFilled />
  <PictureFilled />
  <PieChartFilled />
  <PlayCircleFilled />
  <PlaySquareFilled />
  <PlusCircleFilled />
  <PlusSquareFilled />
  <PoundCircleFilled />
  <PrinterFilled />
  <ProfileFilled />
  <ProjectFilled />
  <PropertySafetyFilled />
  <PushpinFilled />
  <QqCircleFilled />
  <QqSquareFilled />
  <QuestionCircleFilled />
  <ReadFilled />
  <ReconciliationFilled />
  <RedEnvelopeFilled />
  <RedditCircleFilled />
  <RedditSquareFilled />
  <RestFilled />
  <RightCircleFilled />
  <RightSquareFilled />
  <RobotFilled />
  <RocketFilled />
  <SafetyCertificateFilled />
  <SaveFilled />
  <ScheduleFilled />
  <SecurityScanFilled />
  <SettingFilled />
  <ShopFilled />
  <ShoppingFilled />
  <SignalFilled />
  <SketchCircleFilled />
  <SketchSquareFilled />
  <SkinFilled />
  <SkypeFilled />
  <SlackCircleFilled />
  <SlackSquareFilled />
  <SlidersFilled />
  <SmileFilled />
  <SnippetsFilled />
  <SoundFilled />
  <StarFilled />
  <StepBackwardFilled />
  <StepForwardFilled />
  <StopFilled />
  <SwitcherFilled />
  <TabletFilled />
  <TagFilled />
  <TagsFilled />
  <TaobaoCircleFilled />
  <TaobaoSquareFilled />
  <ThunderboltFilled />
  <ToolFilled />
  <TrademarkCircleFilled />
  <TrophyFilled />
  <TwitterCircleFilled />
  <TwitterSquareFilled />
  <UnlockFilled />
  <UpCircleFilled />
  <UpSquareFilled />
  <UsbFilled />
  <VideoCameraFilled />
  <WalletFilled />
  <WarningFilled />
  <WechatFilled />
  <WeiboCircleFilled />
  <WeiboSquareFilled />
  <WindowsFilled />
  <YahooFilled />
  <YoutubeFilled />
  <YuqueFilled />
  <ZhihuCircleFilled />
  <ZhihuSquareFilled />
</div>;


Filled.storyName = "实底风格";

