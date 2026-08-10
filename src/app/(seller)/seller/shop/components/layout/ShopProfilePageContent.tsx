'use client';

import { useState } from 'react';

import { useShopProfile } from '../../hooks/useShopProfile';
import { ShopBasicInfoPanel } from '../basic-info/ShopBasicInfoPanel';
import { ShopProfileEditForm } from '../basic-info/ShopProfileEditForm';
import { ShopIdentityChangeForm } from '../identity/ShopIdentityChangeForm';
import { ShopIdentityPanel } from '../identity/ShopIdentityPanel';
import { ShopTaxAndPayoutChangeForm } from '../tax-and-payout/ShopTaxAndPayoutChangeForm';
import { ShopTaxInfoPanel } from '../tax-and-payout/ShopTaxInfoPanel';
import { ShopProfileHeader } from './ShopProfileHeader';
import { ShopProfileErrorState, ShopProfileSkeleton } from './ShopProfileState';
import { ShopProfileTabs, type ShopProfileTab } from './ShopProfileTabs';
import { ShopProfilePendingChangeBanner } from './ShopProfilePendingChangeBanner';

type SensitiveEditTab = 'tax' | 'identity';

// Điều phối truy vấn, tab và chế độ chỉnh sửa; từng vùng nội dung được giao cho component chuyên trách.
export function ShopProfilePageContent() {
    const [activeTab, setActiveTab] = useState<ShopProfileTab>('basic');
    const [sensitiveEditTab, setSensitiveEditTab] =
        useState<SensitiveEditTab | null>(null);
    const {
        profileQuery,
        form,
        editing: basicEditing,
        categoryName,
        updateMutation,
        startEditing,
        cancelEditing,
        submit,
    } = useShopProfile();

    const editing = basicEditing || sensitiveEditTab !== null;

    // Tab cơ bản lưu ngay; hai tab compliance chỉ mở form tạo request để giữ nguyên dữ liệu đã xác minh trong lúc chờ duyệt.
    const handleStartEditing = () => {
        if (activeTab === 'basic') {
            startEditing();
            return;
        }

        setSensitiveEditTab(activeTab);
    };

    // Đóng đúng loại form đang mở mà không làm mất cache hồ sơ vừa tải.
    const handleCancelEditing = () => {
        if (basicEditing) cancelEditing();
        setSensitiveEditTab(null);
    };

    // Không cho chuyển nhóm trong lúc form mở để tránh làm mất ngữ cảnh của thay đổi chưa lưu.
    const handleTabChange = (tab: ShopProfileTab) => {
        if (!editing) setActiveTab(tab);
    };

    // Gọi refetch có chủ đích khi người dùng bấm thử lại hoặc làm mới từ header.
    const refreshProfile = () => {
        void profileQuery.refetch();
    };

    if (profileQuery.isLoading) {
        return <ShopProfileSkeleton />;
    }

    if (profileQuery.isError || !profileQuery.data) {
        return <ShopProfileErrorState onRetry={refreshProfile} />;
    }

    const profile = profileQuery.data;
    const canEditActiveTab =
        activeTab === 'basic'
            ? profile.capabilities.canUpdatePublicProfile
            : profile.capabilities.canRequestSensitiveChange &&
              !profile.pendingChangeRequest;
    const editLabel = activeTab === 'basic' ? 'Chỉnh sửa' : 'Yêu cầu thay đổi';

    return (
        <div className="overflow-hidden rounded-md border border-zinc-200 bg-white shadow-sm">
            <ShopProfileHeader
                profile={profile}
                editing={editing}
                canEdit={canEditActiveTab}
                editLabel={editLabel}
                refreshing={profileQuery.isFetching}
                onEdit={handleStartEditing}
                onRefresh={refreshProfile}
            />
            {profile.pendingChangeRequest ? (
                <ShopProfilePendingChangeBanner
                    request={profile.pendingChangeRequest}
                />
            ) : null}
            <ShopProfileTabs
                activeTab={activeTab}
                disabled={editing}
                onChange={handleTabChange}
            />

            <div role="tabpanel">
                {basicEditing ? (
                    <ShopProfileEditForm
                        profile={profile}
                        categoryName={categoryName}
                        form={form}
                        saving={updateMutation.isPending}
                        onCancel={handleCancelEditing}
                        onSubmit={submit}
                    />
                ) : sensitiveEditTab === 'tax' ? (
                    <ShopTaxAndPayoutChangeForm
                        profile={profile}
                        onCancel={handleCancelEditing}
                        onSubmitted={handleCancelEditing}
                    />
                ) : sensitiveEditTab === 'identity' ? (
                    <ShopIdentityChangeForm
                        profile={profile}
                        onCancel={handleCancelEditing}
                        onSubmitted={handleCancelEditing}
                    />
                ) : activeTab === 'basic' ? (
                    <ShopBasicInfoPanel
                        profile={profile}
                        categoryName={categoryName}
                    />
                ) : activeTab === 'tax' ? (
                    <ShopTaxInfoPanel profile={profile} />
                ) : (
                    <ShopIdentityPanel profile={profile} />
                )}
            </div>
        </div>
    );
}
