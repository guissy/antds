// import { action } from "@storybook/addon-actions";
// import { JSX, Component } from "solid-js";

import {
  AccountBookTwoTone,
  AlertTwoTone,
  ApiTwoTone,
  AppstoreTwoTone,
  AudioTwoTone,
  BankTwoTone,
  BellTwoTone,
  BookTwoTone,
  BoxPlotTwoTone,
  BugTwoTone,
  BuildTwoTone,
  BulbTwoTone,
  CalculatorTwoTone,
  CalendarTwoTone,
  CameraTwoTone,
  CarTwoTone,
  CarryOutTwoTone,
  CheckCircleTwoTone,
  CheckSquareTwoTone,
  CiCircleTwoTone,
  CiTwoTone,
  ClockCircleTwoTone,
  CloseCircleTwoTone,
  CloseSquareTwoTone,
  CloudTwoTone,
  CodeTwoTone,
  CompassTwoTone,
  ContactsTwoTone,
  ContainerTwoTone,
  ControlTwoTone,
  CopyTwoTone,
  CopyrightCircleTwoTone,
  CopyrightTwoTone,
  CreditCardTwoTone,
  CrownTwoTone,
  CustomerServiceTwoTone,
  DashboardTwoTone,
  DatabaseTwoTone,
  DeleteTwoTone,
  DiffTwoTone,
  DislikeTwoTone,
  DollarCircleTwoTone,
  DollarTwoTone,
  DownCircleTwoTone,
  DownSquareTwoTone,
  EditTwoTone,
  EnvironmentTwoTone,
  EuroCircleTwoTone,
  EuroTwoTone,
  ExclamationCircleTwoTone,
  ExperimentTwoTone,
  EyeInvisibleTwoTone,
  EyeTwoTone,
  FileAddTwoTone,
  FileExcelTwoTone,
  FileExclamationTwoTone,
  FileImageTwoTone,
  FileMarkdownTwoTone,
  FilePdfTwoTone,
  FilePptTwoTone,
  FileTextTwoTone,
  FileTwoTone,
  FileUnknownTwoTone,
  FileWordTwoTone,
  FileZipTwoTone,
  FilterTwoTone,
  FireTwoTone,
  FlagTwoTone,
  FolderAddTwoTone,
  FolderOpenTwoTone,
  FolderTwoTone,
  FrownTwoTone,
  FundTwoTone,
  FunnelPlotTwoTone,
  GiftTwoTone,
  GoldTwoTone,
  HddTwoTone,
  HeartTwoTone,
  HighlightTwoTone,
  HomeTwoTone,
  HourglassTwoTone,
  Html5TwoTone,
  IdcardTwoTone,
  InfoCircleTwoTone,
  InsuranceTwoTone,
  InteractionTwoTone,
  LayoutTwoTone,
  LeftCircleTwoTone,
  LeftSquareTwoTone,
  LikeTwoTone,
  LockTwoTone,
  MailTwoTone,
  MedicineBoxTwoTone,
  MehTwoTone,
  MessageTwoTone,
  MinusCircleTwoTone,
  MinusSquareTwoTone,
  MobileTwoTone,
  MoneyCollectTwoTone,
  NotificationTwoTone,
  PauseCircleTwoTone,
  PhoneTwoTone,
  PictureTwoTone,
  PieChartTwoTone,
  PlayCircleTwoTone,
  PlaySquareTwoTone,
  PlusCircleTwoTone,
  PlusSquareTwoTone,
  PoundCircleTwoTone,
  PrinterTwoTone,
  ProfileTwoTone,
  ProjectTwoTone,
  PropertySafetyTwoTone,
  PushpinTwoTone,
  QuestionCircleTwoTone,
  ReconciliationTwoTone,
  RedEnvelopeTwoTone,
  RestTwoTone,
  RightCircleTwoTone,
  RightSquareTwoTone,
  RocketTwoTone,
  SafetyCertificateTwoTone,
  SaveTwoTone,
  ScheduleTwoTone,
  SecurityScanTwoTone,
  SettingTwoTone,
  ShopTwoTone,
  ShoppingTwoTone,
  SkinTwoTone,
  SlidersTwoTone,
  SmileTwoTone,
  SnippetsTwoTone,
  SoundTwoTone,
  StarTwoTone,
  StopTwoTone,
  SwitcherTwoTone,
  TabletTwoTone,
  TagTwoTone,
  TagsTwoTone,
  ThunderboltTwoTone,
  ToolTwoTone,
  TrademarkCircleTwoTone,
  TrophyTwoTone,
  UnlockTwoTone,
  UpCircleTwoTone,
  UpSquareTwoTone,
  UsbTwoTone,
  VideoCameraTwoTone,
  WalletTwoTone,
  WarningTwoTone
} from "@ant-design/icons-solid";

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

export const TowTone = (args: any) => <div>
  <AccountBookTwoTone />
  <AlertTwoTone />
  <ApiTwoTone />
  <AppstoreTwoTone />
  <AudioTwoTone />
  <BankTwoTone />
  <BellTwoTone />
  <BookTwoTone />
  <BoxPlotTwoTone />
  <BugTwoTone />
  <BuildTwoTone />
  <BulbTwoTone />
  <CalculatorTwoTone />
  <CalendarTwoTone />
  <CameraTwoTone />
  <CarTwoTone />
  <CarryOutTwoTone />
  <CheckCircleTwoTone />
  <CheckSquareTwoTone />
  <CiCircleTwoTone />
  <CiTwoTone />
  <ClockCircleTwoTone />
  <CloseCircleTwoTone />
  <CloseSquareTwoTone />
  <CloudTwoTone />
  <CodeTwoTone />
  <CompassTwoTone />
  <ContactsTwoTone />
  <ContainerTwoTone />
  <ControlTwoTone />
  <CopyTwoTone />
  <CopyrightCircleTwoTone />
  <CopyrightTwoTone />
  <CreditCardTwoTone />
  <CrownTwoTone />
  <CustomerServiceTwoTone />
  <DashboardTwoTone />
  <DatabaseTwoTone />
  <DeleteTwoTone />
  <DiffTwoTone />
  <DislikeTwoTone />
  <DollarCircleTwoTone />
  <DollarTwoTone />
  <DownCircleTwoTone />
  <DownSquareTwoTone />
  <EditTwoTone />
  <EnvironmentTwoTone />
  <EuroCircleTwoTone />
  <EuroTwoTone />
  <ExclamationCircleTwoTone />
  <ExperimentTwoTone />
  <EyeInvisibleTwoTone />
  <EyeTwoTone />
  <FileAddTwoTone />
  <FileExcelTwoTone />
  <FileExclamationTwoTone />
  <FileImageTwoTone />
  <FileMarkdownTwoTone />
  <FilePdfTwoTone />
  <FilePptTwoTone />
  <FileTextTwoTone />
  <FileTwoTone />
  <FileUnknownTwoTone />
  <FileWordTwoTone />
  <FileZipTwoTone />
  <FilterTwoTone />
  <FireTwoTone />
  <FlagTwoTone />
  <FolderAddTwoTone />
  <FolderOpenTwoTone />
  <FolderTwoTone />
  <FrownTwoTone />
  <FundTwoTone />
  <FunnelPlotTwoTone />
  <GiftTwoTone />
  <GoldTwoTone />
  <HddTwoTone />
  <HeartTwoTone />
  <HighlightTwoTone />
  <HomeTwoTone />
  <HourglassTwoTone />
  <Html5TwoTone />
  <IdcardTwoTone />
  <InfoCircleTwoTone />
  <InsuranceTwoTone />
  <InteractionTwoTone />
  <LayoutTwoTone />
  <LeftCircleTwoTone />
  <LeftSquareTwoTone />
  <LikeTwoTone />
  <LockTwoTone />
  <MailTwoTone />
  <MedicineBoxTwoTone />
  <MehTwoTone />
  <MessageTwoTone />
  <MinusCircleTwoTone />
  <MinusSquareTwoTone />
  <MobileTwoTone />
  <MoneyCollectTwoTone />
  <NotificationTwoTone />
  <PauseCircleTwoTone />
  <PhoneTwoTone />
  <PictureTwoTone />
  <PieChartTwoTone />
  <PlayCircleTwoTone />
  <PlaySquareTwoTone />
  <PlusCircleTwoTone />
  <PlusSquareTwoTone />
  <PoundCircleTwoTone />
  <PrinterTwoTone />
  <ProfileTwoTone />
  <ProjectTwoTone />
  <PropertySafetyTwoTone />
  <PushpinTwoTone />
  <QuestionCircleTwoTone />
  <ReconciliationTwoTone />
  <RedEnvelopeTwoTone />
  <RestTwoTone />
  <RightCircleTwoTone />
  <RightSquareTwoTone />
  <RocketTwoTone />
  <SafetyCertificateTwoTone />
  <SaveTwoTone />
  <ScheduleTwoTone />
  <SecurityScanTwoTone />
  <SettingTwoTone />
  <ShopTwoTone />
  <ShoppingTwoTone />
  <SkinTwoTone />
  <SlidersTwoTone />
  <SmileTwoTone />
  <SnippetsTwoTone />
  <SoundTwoTone />
  <StarTwoTone />
  <StopTwoTone />
  <SwitcherTwoTone />
  <TabletTwoTone />
  <TagTwoTone />
  <TagsTwoTone />
  <ThunderboltTwoTone />
  <ToolTwoTone />
  <TrademarkCircleTwoTone />
  <TrophyTwoTone />
  <UnlockTwoTone />
  <UpCircleTwoTone />
  <UpSquareTwoTone />
  <UsbTwoTone />
  <VideoCameraTwoTone />
  <WalletTwoTone />
  <WarningTwoTone />
</div>;


TowTone.storyName = "双色风格";

